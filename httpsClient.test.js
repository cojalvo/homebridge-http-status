const chai = require('chai');
chai.should();

const client = require('./httpClient');
describe('test http client', () => {
    it('test http cleint', async () => {
        const res = await client.doRequest({
            method: 'get',
            headers: undefined,
            baseURL: 'https://google.com',
            data: undefined,
            url: ''
        })

        res.status.should.eql(200);
    })
});