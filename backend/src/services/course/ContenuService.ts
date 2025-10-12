import { Document, Types } from 'mongoose';
import Contenu, { IContenu } from '../../models/course/Contenu';
import ContenuVideo, { IContenuVideo } from '../../models/course/ContenuVideo';
import ContenuDocument, { IContenuDocument } from '../../models/course/ContenuDocument';

// Interface for file upload
interface FileUpload {
  mimetype: string;
  path: string;
}

// Interface for create input (flexible for ContenuVideo or ContenuDocument)
interface ContenuData {
  [key: string]: any; // Flexible to accommodate various fields
}

// Create a new contenu (video or document)
export const create = async (data: ContenuData, file: FileUpload): Promise<IContenuVideo | IContenuDocument> => {
  const type = file.mimetype.startsWith('video') ? 'video' : 'document';
  const ContenuModel = type === 'video' ? ContenuVideo : ContenuDocument;
  const contenu = new ContenuModel({
    ...data,
    [`url${type.charAt(0).toUpperCase() + type.slice(1)}`]: file.path,
  });
  await contenu.save();
  return contenu;
};