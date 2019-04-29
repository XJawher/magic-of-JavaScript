{
    let arrString = 'aabbc';
    // 思想就是把这字符串切片,然后统计重复出现的字母,并且记录该字母出现的次数
    let arr = arrString.split('');
    let data = {

    }
    arr.reduce((previousValue, currentValue, index, array) => {
        if (data[currentValue]) {
            data[currentValue] = data[currentValue] + 1;
        } else {
            data[currentValue] = 1
        }
    }, {})
    console.log(data, arr);
}

{
    let arrString = 'abcdaabc';
    console.log(
        arrString.split('').reduce(function (res, cur) {
            res[cur] ? res[cur]++ : res[cur] = 1
            return res;
        }, {})
    );
}

{
    const bifurcate = (arr, filter) => arr.reduce((acc, val, i) => {
        acc[filter[i] ? 0 : 1].push(val);
        return acc;
    }, [[], []]);
    console.log(bifurcate(['beep', 'boop', 'foo', 'bar'], [true, false, false, true]));
}