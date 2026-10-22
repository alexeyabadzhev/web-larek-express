import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import UnauthorizedError from '../errors/unauthorized-error';

interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: { token: string; }[];
}

interface IUserModel extends mongoose.Model<IUser> {
  findUserByCredentials: (
    email: string,
    password: string,
  ) => Promise<mongoose.HydratedDocument<IUser>>;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    minlength: [2, 'Минимальная длина поля 2 символа'],
    maxlength: [30, 'Максимальная длина поля 30 символов'],
    default: 'Ё-мое',
  },
  email: {
    type: String,
    required: [true, 'Поле должно быть заполнено'],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Некорректный email'],
  },
  password: {
    type: String,
    required: [true, 'Поле должно быть заполнено'],
    minlength: [6, 'Минимальная длина поля 6 символов'],
    select: false,
  },
  tokens: {
    type: [{ token: { type: String } }],
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  this: mongoose.Model<IUser>,
  email: string,
  password: string,
) {
  return this.findOne({ email })
    .select('+password +tokens')
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError('Неправильная почта или пароль'));
      }
      return bcryptjs
        .compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthorizedError('Неправильная почта или пароль'));
          }
          return user;
        });
    });
};

userSchema.pre('save', function hashPassword(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }
  bcryptjs.hash(this.password, 10)
    .then((hash) => {
      this.password = hash;
      next();
    })
    .catch(next);
});

export default mongoose.model<IUser, IUserModel>('user', userSchema);
