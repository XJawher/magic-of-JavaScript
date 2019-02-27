// {
//     let arrString = 'aabbc';
//     // 思想就是把这字符串切片,然后统计重复出现的字母,并且记录该字母出现的次数
//     let arr = arrString.split('');
//     let data = {

//     }
//     arr.reduce((previousValue, currentValue, index, array) => {
//         if (data[currentValue]) {
//             data[currentValue] = data[currentValue] + 1;
//         } else {
//             data[currentValue] = 1
//         }
//     }, {})
//     console.log(data, arr);
// }

// {
//     var arrString = 'abcdaabc';
//     console.log(
//         arrString.split('').reduce(function (res, cur) {
//             res[cur] ? res[cur]++ : res[cur] = 1
//             return res;
//         }, {})
//     );
// }

{
    const bifurcate = (arr, filter) => arr.reduce((acc, val, i) => {
        acc[filter[i] ? 0 : 1].push(val);
        return acc;
    }, [[], []]);
    console.log(bifurcate(['beep', 'boop', 'foo', 'bar'], [true, false, false, true]));
}

{
    import React, { Component } from 'react';
    import { connect } from 'react-redux';
    import lang from '../../components/Language/lang';
    import _ from 'lodash';
    import http from '../../http/requests';
    import { Popover, Icon, message, Button } from 'antd';
    import eventProxy from '../../components/proxy/proxy';
    import { waitSeconds } from '../../services/index';
    import { isAdmin } from '../Group/Group';

    class ClusterChassis extends Component {

        constructor(props) {
            super(props);
            console.log(this.props);
            let diskList = Array.from({ length: 48 }, () => '');
            this.state = {
                popover: false,
                currentValue: '',
                currentDisk: {},
                nodes: {},
                clientWidth: 416,
                diskList,
                stop: false,// 刷新或者刚进入页面的时候让第一个有数据的硬盘选中
            };
        }

        /**
         *
         * @param {硬盘的序号,disk${index} 该功能的存在是为了给硬盘加载边框} currentValue
         * @param {获取当前的硬盘数据,存放到 state 中维护,当点击的时候就是加载到当前硬盘信息中} currentValue2
         */
        async clickDisk(currentValue, currentValue2, param) {
            await this.setState({ currentDisk: currentValue2 });
            if (param === 'nextProps') {
                this.setState({ stop: true });
            }
            try {
                if (currentValue !== this.state.currentValue) {
                    // if (this.state.currentValue !== '') {
                    //     this.refs[this.state.currentValue].style.border = '';
                    // }
                    this.setState({ currentValue: currentValue });
                    // this.refs[currentValue].style.border = '1px dashed #98bf21';
                }
            } catch (error) {
                console.log(error);
                let { nodeInfo: nodes } = this.props;
                let diskList = Array.from({ length: 48 }, () => '');
                if (nodes.disks.length !== 0) {
                    nodes.disks.forEach(item => {
                        diskList[item.slot - 1] = item;
                    });
                }
                let disk = [];
                waitSeconds(1);
                await diskList.forEach((item, index) => {
                    if (item) {
                        disk.push({ item: item, index: `disk${index}` });
                    }
                });
                if (disk.length) {
                    // this.clickDisk(disk[0].index, disk[0].item, 'nextProps');
                    if (disk[0].index !== this.state.currentValue) {
                        if (this.state.currentValue !== '') {
                            this.refs[this.state.currentValue].style.border = '';
                        }
                        this.setState({ currentValue: disk[0].index });
                        // this.refs[disk[0].index].style.border = '1px dashed #98bf21';
                    }
                }
            }
            this.setState({ popover: true });
        }

        componentWillMount() {
            window.addEventListener('resize', this.onWindowResize.bind(this));
        }
        componentWillUnmount() {
            window.removeEventListener('resize', this.onWindowResize.bind(this));
        }

        onWindowResize() {
            try {
                this.setState({ clientWidth: this.refs.diskDetail.clientWidth });
            } catch (error) {
                this.setState({ clientWidth: 416 });
            }

        }
        async componentWillReceiveProps(nextProps) {
            let { nodeInfo: nodes } = nextProps;
            let { stop, currentDisk } = this.state;
            let diskList = Array.from({ length: 48 }, () => '');
            if (nodes.disks.length !== 0) {
                nodes.disks.forEach(item => {
                    diskList[item.slot - 1] = item;
                });
            }
            // let disk = [];
            if (!stop) {
                waitSeconds(1);
                this.resetFirstCheckDisk(diskList, 'nextProps');
            }
            let diskValue = _.isEmpty(currentDisk);
            setTimeout(() => {
                eventProxy.on('drawDisk', async (message) => {
                    if (diskValue) {
                        await this.resetFirstCheckDisk(diskList, 'nextProps');
                    }
                    if (currentDisk.slot === message.slot) {
                        // console.log([currentDisk, mes]);
                        await this.resetFirstCheckDisk(diskList, 'nextProps');
                    }
                });
            }, 2 * 1000);

            try {
                this.setState({ clientWidth: this.refs.diskDetail.clientWidth, diskList });
            } catch (error) {
                this.setState({ clientWidth: 416 });
            }


        }

        async  resetFirstCheckDisk(diskList, from) {
            let disk = [];
            await diskList.forEach((item, index) => {
                if (item) {
                    disk.push({ item: item, index: `disk${index}` });
                }
            });
            if (disk.length) {
                this.clickDisk(disk[0].index, disk[0].item, from);
            }
        }


        /**
         *
         * @param {当前选择的硬盘的数据} currentValue
         * @param {上线或者下线,in代表上线,out 代表下线} inOrOut
         */
        sultDownDisk(currentValue, inOrOut) {
            // console.info(currentValue, inOrOut);
        }

        async  scanDisk(ipAddress) {
            await message.warn(lang(`在IP ${ipAddress} 上扫描硬盘已经开始请稍后!`, `Start deleting snapshot!`));
            await waitSeconds(2);
            try {
                let data = await http.diskScan(ipAddress);
                if (data.code === 0) {
                    await message.success(lang(`在IP ${ipAddress} 上扫描硬盘成功!稍后数据会刷新,请稍后`, `Start deleting snapshot!`));
                    await http.dashborad();
                } else {
                    await message.error(lang(`在IP ${ipAddress} 上扫描硬盘出错了!错误码是:${data.code},错误详情是:${this.props.errorCode[data.code].cn.desc}。`, `Start deleting snapshot!`));
                }
            } catch ({ msg }) {
                message.error(lang(`在IP ${ipAddress} 上扫描硬盘出错了!!!, 请检查网络`, `Delete snapshot failed, reason: `) + msg);
            }
        }

        render() {
            let { diskList, currentDisk } = this.state;
            let { nodeInfo: nodes } = this.props;
            let diskValue = _.isEmpty(currentDisk);
            // let diskPopover = (currentValue) => (<div style={{padding: 0}}>
            //     <p><img src={require('../../images/bd-cluster/bd-cluster-position@1x.png')} alt="solid" /><span style={{marginLeft: 5, marginTop: 24}}>硬盘定位</span></p>
            // </div>);
            if (nodes.disks.length !== 0) {
                nodes.disks.forEach(item => {
                    diskList[item.slot - 1] = item;
                });
            }

            let model = {
                /**
                 * 秦文明圆 服务器  48 磁盘
                 */
                qin: (diskList) => {
                    return (
                        <div
                            className="bd-chassis-img">
                            {
                                diskList.map((currentValue, index) => (
                                    <div key={index}>
                                        <div>
                                            {
                                                currentValue === '' ?
                                                    <div className='bd-chassis-handicap-none' /> : <div className={`bd-chassis-handicap ${currentDisk.slot === currentValue.slot ? 'active' : ''}`} onClick={this.clickDisk.bind(this, `disk${index}`, currentValue)}
                                                    >
                                                        {
                                                            index < 24 ? <p
                                                                className='bd-chassis-handicap-number24'>{currentValue === '' ? index + 1 : index + 1}</p>
                                                                : <p
                                                                    className='bd-chassis-handicap-number48'>{currentValue === '' ? index + 1 : index + 1}</p>
                                                        }
                                                    </div>
                                            }
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    );
                },

                /**
                 *  x86 刀片服务器 56 磁盘
                 */
                x86Blade: () => {

                },

                /**
                 * 申威2U12盘位服务器 12 磁盘位
                 */
                shenWeiU12: (diskList) => {
                    return (
                        <div className="fs-chassis-disk-slot-wrapper">
                            {
                                diskList.map((disk, i) => disk.sn ?
                                    <div
                                        className={`fs-disk-item disk-in ${currentDisk.slot === disk.slot ? 'active' : ''}`}
                                        onClick={this.clickDisk.bind(this, `disk${i}`, disk)}
                                    >
                                        <div className="fs-disk-pic" />
                                        <div className="fs-disk-slot-num">{disk.slot}</div>
                                    </div>
                                    :
                                    <div className="fs-disk-item empty" key={i} />
                                )
                            }
                        </div>
                    );

                },

                /**
                 * 申威 x86 1U10 10 磁盘位
                 */
                shenWeiU10: () => {

                },

                /**
                 * x862U24盘位服务器 24 磁盘位
                 */
                x862U24: () => {

                }
            };

            return (
                <div className='bd-common-list bd-cluster-chassis'>
                    <header><span className='bd-cluster-chassis-information'>{lang('当前节点机箱槽位信息', 'pool list')}</span></header>
                    <div className="bd-cluster-chassis-info">
                        <div className="bd-chassis-part">
                            <div className="bd-chassis-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{lang(`硬盘槽位示意图(空闲槽位${48 - nodes.disks.length})`, '')}</span>
                                <Button type='primary' disabled={isAdmin()} style={{ width: 140, minHeight: 10, marginTop: -6 }} onClick={this.scanDisk.bind(this, nodes.ipAddress)}><Icon type="sync" theme="outlined" />重新扫描磁盘</Button>
                            </div>
                            {
                                model.shenWeiU12(diskList)
                            }
                        </div>
                        <div className="bd-chassis-info">
                            <div className="bd-chassis-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>
                                    {lang('当前硬盘基本信息', '')}
                                </span>
                            </div>
                            <div className="bd-chassis-disk-detail" ref={`diskDetail`}>
                                <div>
                                    <span>{diskValue ? lang('设备名称:--', 'name') : `设备名称: ${this.state.currentDisk.diskName}`}</span>
                                    <span>序列号:{diskValue ? '--' : this.state.clientWidth < 520 ? (this.state.currentDisk.sn.length > 15 ? <Popover placement='rightTop' content={diskValue ? '--' : this.state.currentDisk.sn}>{diskValue ? '--' : this.state.currentDisk.sn.slice(0, 13).concat('...')}</Popover> : this.state.currentDisk.sn) : this.state.currentDisk.sn}</span>
                                </div>
                                <div>
                                    <span>{diskValue ? lang('槽位:--', 'name') : `槽位: ${this.state.currentDisk.slot}`}</span>
                                    <span>{diskValue ? lang('循环次数:--', 'name') : `循环次数: ${this.state.currentDisk.powerCycles}`}</span>
                                </div>
                                <div>
                                    <span>型号:{diskValue ? '--' : this.state.clientWidth < 520 ? (this.state.currentDisk.model.length > 13 ?
                                        <Popover placement="rightTop"
                                            content={diskValue ? '--' : this.state.currentDisk.model}>{diskValue ? '--' : this.state.currentDisk.model.slice(0, 13).concat('...')}</Popover> : this.state.currentDisk.model) : (this.state.currentDisk.model)}</span>
                                    <span>{diskValue ? lang('通电时长:--', 'name') : `通电时长: ${this.state.currentDisk.poweron > 24 ? (this.state.currentDisk.poweron / 24).toFixed(1) + '天' : this.state.currentDisk.poweron + '小时'}`}</span>
                                </div>
                                <div>
                                    <span>{diskValue ? lang('温度:--', 'name') : `温度: ${this.state.currentDisk.temp}℃`}</span>
                                    <span>{diskValue ? lang('固件:--', 'name') : `固件: ${this.state.currentDisk.fw}`}</span>
                                </div>
                                <div>
                                    <span>使用率: {diskValue ? '--' : this.state.currentDisk.usageRate ? this.state.currentDisk.usageRate : '--'}%</span>
                                    <span>{diskValue ? lang('已经使用:--', 'name') : `${this.state.currentDisk.type === 'SSD' ? `磨损度: ${this.state.currentDisk.percentUsed}%` : `转速:${this.state.currentDisk.rpm} RPM`} `}</span>
                                </div>
                                <div>
                                    <span>{this.state.currentDisk.lefttime === undefined ? lang('预测剩余寿命:--', 'name') : `预测剩余寿命: ${this.state.currentDisk.lefttime} 小时`}</span>
                                    <span>{this.state.currentDisk.protocol === undefined ? lang('接口类型:--', 'name') : `接口类型: ${this.state.currentDisk.protocol}`}</span>
                                </div>
                                <div>
                                    <span>产品系列:{this.state.currentDisk.series === undefined ? '--' : this.state.clientWidth < 520 ? (this.state.currentDisk.series.length > 15 ? <Popover placement='rightTop' content={diskValue ? '--' : this.state.currentDisk.series}>{diskValue ? '--' : this.state.currentDisk.series.slice(0, 13).concat('...')}</Popover> : this.state.currentDisk.series) : this.state.currentDisk.series}</span>
                                    <span>{diskValue ? lang('硬盘类型:--', 'name') : `硬盘类型: ${this.state.currentDisk.type}`}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    let mapStateToProps = state => {
        let { language, main: { dashboard: { clusterIOPS }, common: { errorCode } } } = state;
        return { language, clusterIOPS, errorCode };
    };
    export default connect(mapStateToProps)(ClusterChassis);

    // window.removeEventListener('resize', ClusterChassis.onWindowResize);


}