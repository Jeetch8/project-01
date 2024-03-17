import { createServer, Model, Response } from 'miragejs';
import { schemas } from './Schemas';

export function makeServer({ environment = 'test' } = {}) {
  const server = createServer({
    environment,

    models: {
      stat: Model,
      shortendUrl: Model,
      user: Model,
      subscription: Model,
      linkStat: Model,
    },

    factories: {
      app_user: schemas.appUser,
      user_tokens: schemas.userTokens,
      user_profile: schemas.userProfile,
    },

    seeds(server) {
      server.createList('app_user', 10);
      server.createList('user_profile', 20);
      server.createList('user', 5);
      server.createList('subscription', 5);
      server.create('linkStat');
    },

    routes() {
      this.urlPrefix = 'http://localhost:5000';
      this.namespace = '/api/v1';

      this.post('/auth/login/local', (schema, request) => {
        return { token: 'testtoken' };
      });
      this.patch('/auth/request-reset-password', (schema, request) => {
        return { message: 'Email sent' };
      });
      this.patch('auth/reset-password', (schema, request) => {
        return { message: 'Password reseted' };
      });
      this.patch('/auth/verify-email', (schema, request) => {
        return { message: 'Email verified' };
      });
      this.post('/auth/register/local', (schema, request) => {
        return { message: 'user registered' };
      });
    },
  });
  return server;
}
