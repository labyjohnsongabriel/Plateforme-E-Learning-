import { IContenuVideo } from '../../models/course/ContenuVideo';
import { IContenuDocument } from '../../models/course/ContenuDocument';
interface FileUpload {
    mimetype: string;
    path: string;
}
interface ContenuData {
    [key: string]: any;
}
export declare const create: (data: ContenuData, file: FileUpload) => Promise<IContenuVideo | IContenuDocument>;
export {};
//# sourceMappingURL=ContenuService.d.ts.map