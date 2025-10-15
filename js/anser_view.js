const { page_handler } = require('./anser_utily.js'),
{ result_handler } = require('./anser_view_util.js'),
myPage_handler = new page_handler(result_handler);

myPage_handler.load_data().then(result_handler);