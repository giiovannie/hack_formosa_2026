import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../src/config/database.js';
import { initializeModels } from '../src/models/relaciones.js';
import { hashPassword, comparePassword } from '../src/helpers/bcrypt.helper.js';
import { registerCompany } from '../src/helpers/registerCompany.helper.js';
import { createTokenHelpers } from '../src/helpers/jwt.helper.js';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';

const config = { DB_NAME: 'test', DB_USER: 'test', DB_HOST: '127.0.0.1', DB_PORT: '3306' };

test('JWT rejects expired tokens, unexpected algorithms and invalid tenant claims', () => {
  const secret = randomBytes(32).toString('hex');
  const tokens = createTokenHelpers({ JWT_SECRET: secret, JWT_EXPIRES_IN: '3600' });
  const payload = tokens.verifyToken(tokens.generateToken({ id: 1, companyId: 2, role: 'owner' }));
  assert.equal(payload.exp - payload.iat, 3600);
  assert.equal(payload.role, undefined);
  assert.throws(() => tokens.verifyToken(jwt.sign({ id: 1, companyId: 2 }, secret, { expiresIn: -1 })));
  assert.throws(() => tokens.verifyToken(jwt.sign({ id: 1, companyId: 2 }, secret, { algorithm: 'HS384' })));
  assert.throws(() => tokens.verifyToken(jwt.sign({ id: 1, companyId: '2' }, secret)));
  assert.throws(() => createTokenHelpers({ JWT_SECRET: secret, JWT_EXPIRES_IN: 'invalid' }));
});

test('Company and User retain history and enforce tenant relationship', async () => {
  const database = createDatabase(config);
  const { CompanyModel, UserModel } = initializeModels(database);
  assert.equal(CompanyModel.options.paranoid, true);
  assert.equal(UserModel.options.paranoid, true);
  assert.equal(UserModel.rawAttributes.companyId.allowNull, false);
  assert.equal(UserModel.rawAttributes.companyId.references.model, CompanyModel.tableName);
  assert.equal(UserModel.rawAttributes.companyId.onDelete, 'RESTRICT');
  assert.equal(UserModel.rawAttributes.email.unique, true);
  assert.deepEqual(UserModel.options.defaultScope.attributes.exclude, ['password']);
  await assert.rejects(UserModel.build({ firstName: 'Ana', lastName: 'Perez', email: 'test@example.com', password: 'hash', role: 'admin', companyId: 1 }).validate());
  await database.close();
});

test('database configuration rejects other engines and invalid ports', () => {
  assert.throws(() => createDatabase({ ...config, DB_DIALECT: 'sqlite' }));
  assert.throws(() => createDatabase({ ...config, DB_PORT: 'NaN' }));
});

test('password hashing verifies passwords without silently truncating them', async () => {
  const password = 'local-test-password';
  const hash = await hashPassword(password);
  assert.notEqual(hash, password);
  assert.equal(await comparePassword(password, hash), true);
  assert.equal(await comparePassword('incorrect', hash), false);
  await assert.rejects(hashPassword('á'.repeat(37)));
  const boundary = 'a'.repeat(72);
  assert.equal(await comparePassword(`${boundary}b`, await hashPassword(boundary)), false);
});

test('registration uses a single transaction and ignores injected tenant and role', async () => {
  const transaction = {};
  let received;
  const models = {
    CompanyModel: { create: async (data, options) => {
      assert.deepEqual(data, { name: 'Example' });
      assert.equal(options.transaction, transaction);
      return { id: 42, ...data };
    } },
    UserModel: { create: async (data, options) => {
      assert.equal(options.transaction, transaction);
      received = data;
      return data;
    } },
  };
  const database = { transaction: async (callback) => callback(transaction) };
  await registerCompany(database, models, { name: 'Example', id: 8 }, {
    firstName: 'Ana', lastName: 'Perez', email: 'test@example.com',
    password: 'local-test-password', role: 'member', companyId: 999,
  });
  assert.equal(received.companyId, 42);
  assert.equal(received.role, 'owner');
  assert.equal(await comparePassword('local-test-password', received.password), true);
  const failure = new Error('User insert failed');
  models.UserModel.create = async () => { throw failure; };
  await assert.rejects(registerCompany(database, models, { name: 'Example' }, {
    password: 'local-test-password',
  }), (error) => error === failure);
});
