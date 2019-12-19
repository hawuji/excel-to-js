const fs = require('fs');
const path = require('path');
const util = require('util');
const xlsx = require('node-xlsx');

const sheets = xlsx.parse('./file/langes.xlsx');
/**
 * sheets是一个数组，数组中的每一项对应 langes.xlsx 这个文件里的多个表格
 * 如sheets[0]对应 Sheet1 这个表格
 * sheets[1]对应 Sheet2 这个表格
 */
const sheet = sheets[0]; // 我们这里只取第一个表
const filePath = './lang' // 多语言生成后会存放在此目录下

let obj = {}
const col = sheet['data'][0] // 表格中的第一行，用来获取多语言名称以生成对应的 js 文件

for (let j = 3; j < col.length; j++) {
    // sheet 是一个 json 对象，格式为{name:"Sheet1",data:[]}，我们想要的数据就存储在data里
    let key = ''

    // i 对应 excel 文件里的行，根据自己的表格修改
    for (let i = 1; i < sheet["data"].length; i++) {
        let row = sheet['data'][i];

        if (row && row.length > 0) {
            let title = row[0].split('.')
            // 获取表格中的一级模块和二级模块
            if (title.length > 1) {
                key = title[0]
                key2 = title[1]
            } else {
                key2 = title[0]
            }

            !obj[key] && (obj[key] = {})

            obj[key][key2] = row[j]
        }
    }
    const fileName = col[j].split('%')[1]

    creatFile(obj, fileName)
}

/**
* 将数据写入文件
* @param {string} 要写入的内容
* @param {string} 要保存的文件名
*/
async function creatFile(con, name) {
    const str = 'export default '
    // con 中的内容如果不处理的话写入文件后会显示成 [object Object]
    const data = util.inspect(con, { showHidden: false, depth: null })
    const isExists = await getStat(filePath) // 判断路径是否存在
    if (!isExists) {
        await mkdir(filePath) // 创建文件目录
    }
    const file = path.join(filePath, name + '.js')
    fs.writeFile(file, str + data, (err) => {
        if (err) throw err;
        console.log(name + ' 保存成功！');
    });
}

/**
 * 判断目录是否存在
 *  @param {string} dir 目录
 */
function getStat(dir) {
    return new Promise((resolve, reject) => {
        fs.stat(dir, (err, stats) => {
            if (err) {
                resolve(false)
            } else {
                resolve(stats)
            }
        })
    })
}

/**
 * 创建文件夹
 * @param {string} dir 要创建的文件夹路径
 */
function mkdir(dir) {
    return new Promise((resolve, reject) => {
        fs.mkdir(dir, (err) => {
            if (err) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}