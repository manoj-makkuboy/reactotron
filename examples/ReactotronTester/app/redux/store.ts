import { createStore, combineReducers, applyMiddleware, compose } from "redux"
import ReduxThunk from "redux-thunk"
import createSagaMiddleware from "redux-saga"
import { all, fork, call } from "redux-saga/effects"
import Reactotron from "reactotron-react-native"

function dummyReducer(state = { counter: 0 }, action) {
  switch (action.type) {
    case "RandomThunkAction":
      return {
        ...state,
        counter: state.counter + 1,
      }
  }

  return state
}

function test1() {
  return new Promise(resolve => {
    setTimeout(() => resolve(), 2500)
  })
}

function test2() {
  return new Promise(resolve => {
    setTimeout(() => resolve(), 1500)
  })
}

function* runCalls() {
  yield call(test1)
  yield all([call([test1, test2]), call(test2)])
}

function* mySaga() {
  yield all([fork(runCalls)])
}

const rootReducer = combineReducers({ dummy: dummyReducer })

const sagaMiddleware = createSagaMiddleware({ sagaMonitor: Reactotron.createSagaMonitor() })

const middleware = applyMiddleware(ReduxThunk, sagaMiddleware)

export default () => {
  Reactotron.createSagaMonitor()

  const store = createStore(
    rootReducer,
    compose(
      middleware,
      Reactotron.createEnhancer()
    )
  )
  // const store = (Reactotron as any).createStore(rootReducer, compose(middleware))

  sagaMiddleware.run(mySaga)

  return store
}
