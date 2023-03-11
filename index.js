const fs = require('node:fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');

//////////////////////////////////////////////
//FILes
// fs.readFile('1-node-farm/starter/txt/start.txt','utf-8',(err,data) => {
//     fs.readFile(`1-node-farm/starter/txt/${data}.txt`,'utf-8',(err,data1)=>{
//         console.log(data1)
//         fs.readFile(`1-node-farm/starter/txt/append.txt`,'utf8',(err,data2)=>{
//             console.log(data2+":D")
//             fs.writeFile(`1-node-farm/starter/txt/final.txt` , `${data1} \n ${data2}`,err=>{
//                 console.log('The file has been written :"D')
//             })
//         })
//     })
// });
// console.log('i don\'t belong to them')

/////////////////////////////////////////
//SERVER

const replaceTemplate = (template, el) => {
  let output = template.replace(/{%PRODUCTNAME%}/g, el.productName);
  output = output.replace(/{%IMAGE%}/g, el.image);
  output = output.replace(/{%QUANTITY%}/g, el.quantity);
  output = output.replace(/{%PRICE%}/g, el.price);
  output = output.replace(/{%FROM%}/g, el.from);
  output = output.replace(/{%NUTRIENTS%}/g, el.nutrients);
  output = output.replace(/{%DESCRIPTION%}/g, el.description);
  output = output.replace(/{%ID%}/g, el.id);

  if (!el.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');

  return output;
};

//prepare data +files
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, `utf8`);
const tempCardHTML = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf8'
);
const tempOverviewHTML = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf8'
);
const tempProductHTML = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf8'
);
const dataObj = JSON.parse(data);
const cardsHTML = dataObj
  .map((elm) => replaceTemplate(tempCardHTML, elm))
  .join('');
const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));

console.log(slugs);
//server
const SERVER = http.createServer((req, res) => {
  let urlPath = req.url;
  const { query, pathname } = url.parse(req.url, true);
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    const output = tempOverviewHTML.replace(/{%PRODUCT_CARDS%}/g, cardsHTML);

    res.end(output);
  } else if (pathname === '/product') {
    const product = dataObj[query.id];

    res.writeHead(200, { 'Content-type': 'text/html' });

    const output = replaceTemplate(tempProductHTML, product);
    res.end(output);
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello world',
    });
    res.end('<h1>404 not fount</h1>');
  }
});

SERVER.listen(8000, '127.0.0.1', () => {
  console.log('Listening to request on port 8000');
});
