import createDeug from 'debug';
import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../types/http.error.js';
import { Auth } from '../services/auth.js';
import { UsersMongoRepo } from '../repos/users/users.mongo.repo.js';

const debug = createDeug('W7E:auth:interceptor');

export class AuthInterceptor {
  constructor() {
    debug('Instantiated');
  }

  authorization(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenHeader = req.get('Authorization'); // Authorization es el nombre del header, el metodo get lo busca.
      if (!tokenHeader?.startsWith('Bearer'))
        throw new HttpError(401, 'Unauthorized');
      const token = tokenHeader.split(' ')[1]; // Extrae el token, el split separa el token del Bearer
      const tokenPayload = Auth.verifyAndGetPayload(token); //
      req.body.id = tokenPayload.id; //
      next();
    } catch (error) {
      next(error);
    }
  }

  async authentication(req: Request, res: Response, next: NextFunction) {
    try {
      // Eres el usuario
      const userID = req.body.id;
      // Queres actuar sobre la quote req.params.id
      const userToAddID = req.params.id;
      const repoUsers = new UsersMongoRepo();
      const user = await repoUsers.getById(userToAddID);
      if (user.id !== userID)
        throw new HttpError(401, 'Unauthorized', 'User not valid');
      next();
    } catch (error) {
      next(error);
    }
  }
}
