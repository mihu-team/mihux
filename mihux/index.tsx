import React, { Fragment, useContext, useEffect, useMemo, useState } from 'react'
import createStore from 'react-hooks-redux'
import { Map, fromJS } from 'immutable'

interface registerType {
  state: object
  sync?: object
  async?: object
}
interface MapOrObjType {
  [key: string]: any
}

interface doReducerType {
  type: string
  reducer: (state: MapOrObjType) => MapOrObjType
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
  private state: MapOrObjType = {}
  private returnMap: MapOrObjType = {}
  private store: MapOrObjType = {}
  private mutation: MapOrObjType = {}
  private mapState: MapOrObjType = {}
  private set: (key: string, value: any) => MapOrObjType = (key, value) => {
    let newState: MapOrObjType = Object.assign({}, this.store.getState())
    let mapState: MapOrObjType = Map({ ...newState })
    return mapState.set(key, value)
  }
  private setIn: (keys: string[], value: any) => MapOrObjType = (keys, value) => {
    let newState: MapOrObjType = Object.assign({}, this.store.getState())
    let mapState: MapOrObjType = Map({ ...newState })
    return mapState.setIn(keys, value)
  }
  private merge: (newSatet: MapOrObjType) => MapOrObjType = (values) => {
    let newState: MapOrObjType = Object.assign({}, this.store.getState())
    let mapState: MapOrObjType = Map({ ...newState })
    return mapState.merge({ ...values })
  }
  private getValue: (state: MapOrObjType, key: string) => any = (state, key) => {
    let values: any = state.get(key)
    try {
      return values.toJS()
    } catch {
      return values
    }
  }
  private mapMutation: (fns: MapOrObjType, model: string, flag?: string) => void = (fns, model, flag) => {
    const me: this = this
    const createReducer: (key: string, mapNewState: MapOrObjType) => void = (key, mapNewState) => {
      const doReducer: () => doReducerType = () => {
        return {
          type: key,
          reducer(state: MapOrObjType) {
            let mapState: any = fromJS(state)
            me.returnMap = mapState?.merge(mapNewState)
            return me.returnMap.toJS()
          },
        }
      }
      let reducer: MapOrObjType = doReducer()
      this.store.dispatch(reducer)
      return reducer
    }
    let builtIn: MapOrObjType = {
      mutation: this.mutation[model],
      setState: this.set,
      setInState: this.setIn,
      mergeState: this.merge,
      getValue: this.getValue
    }
    Object.keys(fns).forEach((key) => {
      switch (flag) {
        case 'async':
          let toUpperCaseKey: string = 'async' + key.replace(key[0], key[0].toUpperCase());
          (this.mutation[model][toUpperCaseKey] = async (values: any) => {
            return createReducer(toUpperCaseKey, await fns[key](this.returnMap, values, builtIn))
          })
          break;
        default:
          (this.mutation[model][key] = (values: any) => {
            return createReducer(key, fns[key](this.returnMap, values, builtIn))
          })
      }
    })
  }
  private init: () => { store: MapOrObjType; Provider: any } = () => {
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
    const newProps: { store: MapOrObjType } = { store }
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