# 一些在工作中用到的 JavaScript 的奇技淫巧

## 数组的操作
### 1 对一个数组进行全部的元素进行遍历看是不是符合某个条件,这里的元素都是非引用类型的

    const arrayAll  = (arr ,fn = Boolean) => arr.every(fn)
    // 使用 js 的数组 every 函数,做出检测看是不是整个数组全部元素都满足某个条件
    {
        arrayAll([1,2,3],x=>x>2);// false 其中的3 不满足条件,因此返回的是 false
        arrayAll([1,2,3], x => x >0); // true 全部的元素都是符合这个条件的
    }

### 2 全部元素是不是都等于某个值,这里的元素都是非引用类型的

    let allIsEqual = arr => arr.every(value => value === arr[0])
    //这里的和 1 当中的是一样的,同样的使用了数组中的 every 函数,通过检测全部的数组元素是不是和第一元素强相等
    allIsEqual([1,2,3,4,5]) // false
    allIsEqual([1,1,1,1]) // true

### 3 一部分的元素是不是满足一个条件,这里的元素是非引用类型的

    let someOFArray = (arr, fn = Boolean) => arr.some(fn)
    //  通过 some 方法去检测数组中的某个元素是不是符合某个条件,在实际的项目中 some 还是很常见的,
    // some可以很快速的去做判定某个条件下数组中的元素是不是可以符合条件
    someOFArray([1,3,4,5], x => x > 6) // false  所有的元素都是不符合这个规则的
    someOFArray([1,2,3,4], x => x > 2) // true 在数组中 3,4 都是符合条件的

