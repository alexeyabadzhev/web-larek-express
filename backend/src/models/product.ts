import mongoose from 'mongoose';
import { removeFile } from '../utils/files';

interface IProduct {
  title: string;
  image: {
    fileName: string,
    originalName: string
  };
  category: string;
  description: string;
  price: number | null;
}

const productSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    required: [true, 'Поле должно быть заполнено'],
    unique: true,
    minlength: [2, 'Минимальная длина поля 2 символа'],
    maxlength: [30, 'Максимальная длина поля 30 символов'],
  },
  image: {
    type: {
      fileName: {
        type: String,
      },
      originalName: {
        type: String,
      },
    },
    required: [true, 'Поле должно быть заполнено'],
  },
  category: {
    type: String,
    required: [true, 'Поле должно быть заполнено'],
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    default: null,
  },
});

productSchema.post('findOneAndDelete', (file) => {
  if (file?.image?.fileName) removeFile(file.image.fileName);
});

productSchema.post('deleteOne', { document: true, query: true }, (file) => {
  if (file?.image?.fileName) removeFile(file.image.fileName);
});

export default mongoose.model<IProduct>('product', productSchema);
