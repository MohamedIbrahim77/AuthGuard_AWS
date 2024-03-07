
const AWS = require('aws-sdk');
AWS.config.update({
    region: 'your-region'
})
const util = require('../utils/util');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'your-table-name';
const bcrypt = require('bcryptjs');
const auth = require('../utils/auth');


async function login(user) {
    const username = user.username;
    const password = user.password;
    if (!user || !username || !password) {
        return util.buildResponse(401, {
            message: 'Username and password are required'
        });
    }

    const dynamoUser = await getUser(username.toLowerCase().trim());
    if (!dynamoUser || !dynamoUser.username) {
        return util.buildResponse(403, { message: 'User does not exist' });
    }

    if (!bcrypt.compareSync(password, dynamoUser.password)) {
        return util.buildResponse(403, { message: 'incorrect password' });
    }

    const userInfo = {
        username: dynamoUser.username,
        name: dynamoUser.name
    }

    const token = auth.generateToken(userInfo);
    const response = {
        user: userInfo,
        token: token
    }
    return util.buildResponse(200, response);

}

async function getUser(username) {
    const params = {
        TableName: userTable,
        Key: {
            username: username
        }
    }

    return await dynamodb.get(params).promise().then(response => {
        return response.Item;
    }, error => {
        console.error('There is an error geting the user:', error);
    })
}


module.exports.login = login;