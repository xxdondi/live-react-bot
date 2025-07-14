import {
  Action,
  Thunk,
  action,
  createStore,
  createTypedHooks,
  thunk,
} from 'easy-peasy'

enum UPLOAD_STATES {
  NOT_STARTED,
  UPLOADING,
  UPLOADED,
  ERROR,
}

export interface ReactionAppModel {
  env: {
    initialized: boolean
    telegramAvailable: boolean
    vw?: number
    vh?: number
  }
  uploadState: UPLOAD_STATES
  setEnv: Action<ReactionAppModel, Partial<ReactionAppModel['env']>>
  setUploadState: Action<ReactionAppModel, UPLOAD_STATES>
  init: Thunk<ReactionAppModel>
}

const { useStore, useStoreActions, useStoreDispatch, useStoreState } =
  createTypedHooks<ReactionAppModel>()

const store = createStore<ReactionAppModel>({
  env: {
    initialized: false,
    telegramAvailable: false,
    vw: undefined,
    vh: undefined,
  },
  uploadState: UPLOAD_STATES.NOT_STARTED,
  init: thunk(async (actions) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const telegramAvailable =
      // @ts-ignore
      window.Telegram !== undefined && window.Telegram.WebApp !== undefined
    actions.setEnv({
      initialized: true,
      telegramAvailable,
      vw,
      vh,
    })
  }),
  setEnv: action((state, payload) => {
    state.env = { ...state.env, ...payload }
  }),
  setUploadState: action((state, payload) => {
    state.uploadState = payload
  }),
})

export {
  store,
  useStore,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
  UPLOAD_STATES,
}
