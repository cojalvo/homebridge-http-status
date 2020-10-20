const chai = require('chai');
chai.should();
describe('general test', () => {
    it ('test parsing', () => {
        const json = {"data":{"accountSnapshot":{"id":"267","sites":[{"id":"7716","status":"disconnected"},{"id":"7240","status": "connected"},{"id":"12310","status":"disconnected"},{"id":"8638","status":"disconnected"},{"id":"12311","status":"disconnected"}],"timestamp":"2020-10-20T20:16:02Z"}}};

        const path = 'data.accountSnapshot.sites.1.status';
        const expectedResult = "connected";

        let p = json;
        const parts = path.split('.');
        parts.forEach(part => {
            p = p[part];
        });

       p.should.equal(expectedResult);
    })
});