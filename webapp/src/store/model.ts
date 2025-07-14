import { Action } from 'easy-peasy'

export enum UPLOAD_STATES {
  NOT_STARTED,
  UPLOADING,
  UPLOADED,
  ERROR,
}

export interface ReactionAppModel {
  uploadState: UPLOAD_STATES
  setUploadState: Action<ReactionAppModel, UPLOAD_STATES>
}
