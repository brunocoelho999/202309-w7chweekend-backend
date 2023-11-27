import { NextFunction, Request, Response } from 'express';
import createDebug from 'debug';
import { UsersMongoRepo } from '../repos/users/users.mongo.repo.js';
import { Auth } from '../services/auth.js';
import { User } from '../entities/user.js';
import { Controller } from './controller.js';

const debug = createDebug('W7E:users:controller');

export class UsersController extends Controller<User> {
  constructor(protected repo: UsersMongoRepo) {
    super(repo);
    debug('Instantiated');
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = req.body.userId
        ? await this.repo.getById(req.body.userId) // Guarda el id del usuario proviniente del token
        : await this.repo.login(req.body);

      const data = {
        // Aquí se crea el token
        user: result,
        token: Auth.signJWT({
          // Auth es una clase que tiene un método estático signJWT,
          id: result.id, // Hemos creado un usuario con el id y el email. Podríamos haber creado otras propiedades, con mensajes, etc.
          email: result.email,
        }),
      };
      res.status(202); // Aquí
      res.statusMessage = 'Accepted'; // Aquí se envía el token
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // Async logout(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const token = req.headers.authorization?.split(' ')[1];
  //     res.status(200).json({ message: 'Logged out successfully' });
  //   } catch (error) {
  //     next(error);
  //   }
  // }
}
