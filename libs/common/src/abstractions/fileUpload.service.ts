import { EncArrayBuffer } from "../models/domain/enc-array-buffer";
import { EncString } from "../models/domain/enc-string";
import { AttachmentUploadDataResponse } from "../models/response/attachmentUploadDataResponse";
import { SendFileUploadDataResponse } from "../models/response/sendFileUploadDataResponse";

export abstract class FileUploadService {
  uploadSendFile: (
    uploadData: SendFileUploadDataResponse,
    fileName: EncString,
    encryptedFileData: EncArrayBuffer
  ) => Promise<any>;
  uploadCipherAttachment: (
    admin: boolean,
    uploadData: AttachmentUploadDataResponse,
    fileName: EncString,
    encryptedFileData: EncArrayBuffer
  ) => Promise<any>;
}
