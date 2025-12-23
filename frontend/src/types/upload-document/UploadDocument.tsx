

export type UploadDocumentBody = {
    fileName: string;
    contentType: string;
}

export type UploadDocumentResponse = {
    uploadURL: string;
    objectKey: string;
}