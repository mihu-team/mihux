## Mihux 使用文档

### Mihux 是什么

Mihux 是一款 基于 react-hooks-redux 封装的react状态管理器，力求更大程度的简化数据流转，使开发者将更多的精力放在更有价值的代码逻辑实现上

### 主要思想
- Mihux 是一款面向新手的react状态管理器
- Mihux 采用集中注册，集中输出的方式管理数据
- Mihux 模拟双向数据绑定，并采用 immutable 对数据进行 map 化处理，防污染

---

### 目录结构

- DVC（数据管理器）模式是 Mihux 推荐的目录结构

```
src
 ├─ containers
 │   └─ PageName - 业务模块
 │        ├─ dvc
 │        │   ├─ mutation.js - 方法集
 │        │   ├─ dataOv.js - 数据字段实例
 │        │   └─ index.js  - 注册入口
 │        ├─ index.scss
 │        └─ index.tsx - 页面入口 
```

### 快速上手

- dvc/dataOv

```
// 导出一个数据实例（
// 条件允许的情况下可与接口参数名保持一致
export default {
    testData: 0,
    asyncTestData: 0,
}
```

- dvc/mutation

```
// 异步方法集
export const async = {
    async toDoSth(state, values, { getValue, setState, setInState, mergeState, mutation }) {
        const anyThing = () => new Promise(resove => {
            let data = getValue(state,'asyncTestData') //如果为map则返回常规值
            setTimeout(() => {
                data++
                resove(data)
            }, 1000)
        })
        let res = await anyThing()
        // 必须 return 一个 map 用于 dispatch
        return mergeState({ asyncTestData: res })
    }
}

//  同步方法集
export const sync = {
    toDoSth(state, values, { getValue, setState, setInState, mergeState, mutation }) {
        let test = getValue(state, 'testData')
        test++
        // 必须 return 一个 map 用于 dispatch
        return setState('testData',test)
    }
}
```
 `state` - map 格式的数据实例

`values` - 接收任意格式的入参

`getValue` - 执行 `state.get(name)` 得到 `map` 则 return `toJS` 后的结果 ,否则 直接 return

`setState` - return 一个 map 用法同 mapDatas.set

`setInState` - return 一个 map 用法同 mapDatas.setIn

`mergeState` - return 一个 map 用法同 mapDatas.merge

`mutation` - 包含自定义的同步方法集和异步方法集

异步方法以 `async` 开头，原方法首字母大写

以上述代码为例，`async toDoStr`  调用时为 `mutation.asyncToDoStr()`

- dvc/index

```
import { Mihux, Context, useComponent } from 'mihux'
import state from './dataOv'
import { sync, async } from './mutation'
const mihux = new Mihux()
mihux.register({
    state, // 绑定数据实例
    sync, // 绑定同步方法
    async // 绑定异步方法
})
const Provider = mihux.Provider
export { Provider, Context, useComponent }
```

`Provider` - 数据共享容器

`Context` - 数据存储上下文

`useComponent` - 兼容类组件（不完全兼容）

- 在业务代码中使用

```
import React, { purComponent, useContext } from 'react';
import { Provider, Context, useComponent } from '../dvc'
function App(){
    return (
        <Provider>
            <ChildFunc/>
            <ChildClassToFunc/>
        </Provider>
    )
}

const ChildFunc = (props) => {
    const {
        testData,
        asyncTestData,
        toDoSth,
        asyncToDoSth
    } = useContext(Context)
    return (
        ...
    )
}

class ChildClass extends purComponent {
    render(){
        const {
            testData,
            asyncTestData,
            toDoSth,
            asyncToDoSth
        } = useContext(Context)
        return (
            ...
        )
    }
}

const ChildClassToFunc = useComponent(ChildClass)

```

借助 `useComponent` 可以在 `class component` 中使用所有 `hooks` 的 api，但抛弃了除 `componentWillMount` 和 `componentDidMount` 之外的 钩子函数

---

### 灵感来源
Mihux 参考依赖或参考两款已有的开源状态管理器完成开发：

- 基础依赖：React-hooks-redux：

package: [https://developer.aliyun.com/mirror/npm/package/react-hooks-redux](https://developer.aliyun.com/mirror/npm/package/react-hooks-redux)

- 用法借鉴：Lugiax：

github: [https://github.com/lugia-ysstech/lugiax](https://github.com/lugia-ysstech/lugiax) 

熟悉上述两款react状态管理器，将有助于了解 Mihux 

---

### Mihux 源码：
Github：[https://github.com/mihu-team/mihux](https://github.com/mihu-team/mihux)