import React, { Fragment, useContext, useEffect, useMemo, useState } from 'react'
import createStore from 'react-hooks-redux'
import { Map, fromJS } from 'immutable'

type anyObject = Record<string | number | symbol, any>

interface registerType {
  state: object
  sync?: object
  async?: object
}

interface doReducerType {
  type: string
  reducer: (state: anyObject) => anyObject
}

interface MapType {
  [key: string]: any
}

const Context: React.Context<any> = React.createContext({})

const useComponent: (Component: new (props: any) => any) => any = (Component) => {
  return (props: any) => {
    const component = useMemo(() => new Component(props), []);
    let [state, setState] = useState(component.state);
    component.setState = setState;
    useEffect(() => {
      if (component.componentWillMount) {
        component.componentWillMount()
      }

      if (component.componentDidMount) {
        component.props = props;
        component.state = state;
        component.componentDidMount()
      }

      return () => {
        if (component.componentWillUnMount) {
          component.componentWillUnMount()
        }
      }
    }, [])

    component.props = props;
    component.state = state;
    return component.render()
  };
}

class Mihux {
  private state: anyObject = {}
  private returnMap: anyObject = {}
  private store: anyObject = {}
  private mutation: anyObject = {}
  private mapState: any = {}
  private set: (key: string, value: any) => MapType = (key, value) => {
    let newState: anyObject = Object.assign({}, this.store.getState())
    let mapState: any = Map({ ...newState })
    return mapState.set(key, value)
  }
  private setIn: (keys: string[], value: any) => MapType = (keys, value) => {
    let newState: anyObject = Object.assign({}, this.store.getState())
    let mapState: any = Map({ ...newState })
    return mapState.setIn(keys, value)
  }
  private merge: (newSatet: anyObject) => MapType = (values) => {
    let newState: anyObject = Object.assign({}, this.store.getState())
    let mapState: MapType = Map({ ...newState })
    return mapState.merge({ ...values })
  }
  private getValue: (state: MapType, key: string) => any = (state, key) => {
    let values: any = state.get(key)
    try {
      return values.toJS()
    } catch {
      return values
    }
  }
  private mapMutation: (fns: anyObject, model: string, flag?: string) => void = (fns, model, flag) => {
    Object.keys(fns).forEach((key) => {
      switch (flag) {
        case 'async':
          let toUpperCaseKey: string = 'async' + key.replace(key[0], key[0].toUpperCase())
          return (this.mutation[model][toUpperCaseKey] = async (values: any) => {
            let mapNewState: MapType = await fns[key](this.returnMap, values, {
              mutation: this.mutation[model],
              setState: this.set,
              setInState: this.setIn,
              mergeState: this.merge,
              getValue: this.getValue
            })
            const me: this = this
            const doReducer: () => doReducerType = () => {
              return {
                type: toUpperCaseKey,
                reducer(state: anyObject) {
                  let mapState: any = fromJS(state)
                  me.returnMap = mapState?.merge(mapNewState)
                  return me.returnMap.toJS()
                },
              }
            }
            this.store.dispatch(doReducer())
          })
        default:
          return (this.mutation[model][key] = (values: any) => {
            let mapNewState: MapType = fns[key](this.returnMap, values, {
              mutation: this.mutation[model],
              setState: this.set,
              setInState: this.setIn,
              mergeState: this.merge,
            })
            const me: this = this

            const doReducer: () => doReducerType = () => {
              return {
                type: key,
                reducer(state) {
                  let mapState: any = fromJS(state)
                  me.returnMap = mapState?.merge(mapNewState)
                  return me.returnMap.toJS()
                },
              }
            }
            this.store.dispatch(doReducer())
          })
      }
    })
  }
  private init: () => { store: anyObject; Provider: any } = () => {
    const { Provider, store } = createStore({ initialState: { ...this.state } })
    this.store = store
    this.mapState = Map({ ...this.state })
    this.returnMap = this.mapState
    return { store, Provider }
  }
  public register: (registerProps: registerType) => void = (registerProps) => {
    let { state = {}, sync = {}, async = {} } = registerProps
    let model = '@__for_page__model__mihux__key__only_global__!_{0}_{0}_$_#!_'
    this.mutation[model] = {}
    this.mapMutation(sync, model)
    this.mapMutation(async, model, 'async')
    this.state = Object.assign({}, { ...state }, { ...this.mutation[model] })
  }
  public Provider: React.FC<any> = (props: any) => {
    const { store, Provider } = this.init()
    const newProps: { store: anyObject } = { store }
    const ProviderChildren: React.FC<any> = props => {
      const { store } = useContext(Context)
      const { children } = props
      const state = store.useContext()
      return (
        <Context.Provider value={state}>
          {children}
        </Context.Provider>
      )
    }

    return (
      <Context.Provider value={newProps}>
        <Provider>
          <ProviderChildren {...props} />
        </Provider>
      </Context.Provider>
    )
  }
}

export { Mihux, Context, useComponent }