# vite-plugin-ynqq-log


```ts
// 提交接口
// #ynqq.log
const submitAction = async (data: {id: number}[]) => {
  // await sleep(500)
  const getFun = /*#ynqq.log*/ () => {
    const a = {a: "asd"}
  }
  return data
}

```
to
```ts
// 提交接口
// #ynqq.log
const submitAction = async (data: {
  id: number
}[]) => {
  // await sleep(500)
  const getFun = /*#ynqq.log*/() => {
    const a = {
      a: "asd"
    };
    console.log('VARS---a:', a);
  };
  const _ynqq_data_return = data;
  console.log('RETURN---', _ynqq_data_return);
  return _ynqq_data_return;
  ;
};
```