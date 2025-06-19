const chai = require('chai');
const chaiHttp = require('chai-http');
const {onRequest} = require('firebase-functions/v2/https');
const functions = require('../index');

chai.use(chaiHttp);
const expect = chai.expect;

const FUNCTION_URL = process.env.ASK_AI_URL || 'http://localhost:5001/urbanpulse-4ecaa/us-central1/askAI';

describe('askAI Cloud Function', function() {
    this.timeout(10000); // OpenAI може да е бавен

    it('should return a reply for a valid message', async () => {
        const res = await chai.request(FUNCTION_URL)
            .post('/')
            .send({ message: 'What is the capital of France?' });
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('reply');
        expect(res.body.reply).to.be.a('string');
    });

    it('should return 400 for missing message', async () => {
        const res = await chai.request(FUNCTION_URL)
            .post('/')
            .send({ });
        expect(res).to.have.status(400);
    });
}); 