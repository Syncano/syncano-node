/* global describe it beforeEach afterEach before after */
import { expect } from 'chai'
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import axios from 'axios'
import format from 'chalk'

import context from '../../src/utils/context'
import { SocketSearch } from '../../src/commands'

sinon.test = sinonTestFactory(sinon)

describe('[commands] Search Sockets', function () {
  const nameKeyword = 'Segment'
  const lowerCasedNameKeyword = nameKeyword.toLowerCase()
  const socketSearch = new SocketSearch(context)
  const serverResponse = {
    status: 200,
    statusText: 'OK',
    data: {
      status: 'success',
      result: {
        stderr: '',
        // eslint-disable-next-line max-len
        stdout: '[{"description":"Segment Integration","author":"Syncano","tags":{"type":"relation","target":"tag","value":["analytics","segment.io"]},"version":"0.1","name":"segment"}]'
      }
    }
  }

  describe('finds', function () {
    beforeEach(function () {
      sinon.stub(axios, 'post').returns(Promise.resolve(serverResponse))
    })

    afterEach(function () {
      axios.post.restore()
    })

    // it('by name', async function() {
    //   const searchResult = await socketSearch.run([nameKeyword, {}]);
    //   const socketName = searchResult[0][0].toLowerCase();
    //
    //   return expect(socketName).to.include(lowerCasedNameKeyword);
    // });
    //
    // it('by description', async function() {
    //   const searchResult = await socketSearch.run([nameKeyword, {}]);
    //   const socketDesc = searchResult[0][1].toLowerCase();
    //
    //   return expect(socketDesc).to.include(lowerCasedNameKeyword);
    // });
    //
    // it('by keywords', async function() {
    //   const searchResult = await socketSearch.run([nameKeyword, {}]);
    //   const socketKeywords = searchResult[0][4].toLowerCase();
    //
    //   return expect(socketKeywords).to.include(lowerCasedNameKeyword);
    // });
  })

  describe('formated response', function () {
    // let parsedResponse = null;

    before(function () {
      sinon.stub(context.Registry.prototype, 'searchSocketsByAll').returns(Promise.resolve(serverResponse))
      // parsedResponse = JSON.parse(serverResponse.data.result.stdout);
    })

    after(function () {
      context.Registry.prototype.searchSocketsByAll.restore()
    })

    // it('is an object', async function() {
    //   const formatedResponse = await socketSearch.run([lowerCasedNameKeyword, {}]);
    //
    //   expect(formatedResponse).to.be.an('object');
    // });

    // it('row is an array', async function() {
    //   const formatedResponse = await socketSearch.run([lowerCasedNameKeyword, {}]);
    //
    //   expect(formatedResponse[0]).to.be.an('array');
    // });
    //
    // it('has name of socket', async function() {
    //   const formatedResponse = await socketSearch.run([lowerCasedNameKeyword, {}]);
    //   const socketName = parsedResponse[0].name;
    //
    //   expect(formatedResponse[0][0]).to.include(socketName);
    // });

    // it('wordWrap is undefined when options are empty object', async function() {
    //   const formatedResponse = await socketSearch.run([lowerCasedNameKeyword, {}]);
    //   const wordWrapResponseOption = formatedResponse.options.wordWrap;
    //   const expectedResult = Object.prototype.hasOwnProperty.call(formatedResponse.options, 'wordWrap');
    //
    //   expect(expectedResult).to.be.true;
    //   expect(wordWrapResponseOption).to.be.undefined;
    // });

    // it('wordWrap is set to true when option long is passed', async function() {
    //   const formatedResponse = await socketSearch.run([lowerCasedNameKeyword, { long: true }]);
    //   const wordWrapResponseOption = formatedResponse.options.wordWrap;
    //   const expectedResult = Object.prototype.hasOwnProperty.call(formatedResponse.options, 'wordWrap');
    //
    //   expect(expectedResult).to.be.true;
    //   expect(wordWrapResponseOption).to.be.true;
    // });
  })

  describe('colors response', function () {
    const itemInfoObject = {
      name: 'segment',
      description: 'Segment Integration',
      author: 'Syncano',
      version: '0.1',
      tag: 'analytics, segment.io'
    }

    socketSearch.keyword = 'keyword'

    // it('when found term in name', function() {
    //   const coloredResponse = socketSearch.colorResponse(itemInfoObject.name, lowerCasedNameKeyword);
    //
    //   expect(coloredResponse).to.contain(format.green(lowerCasedNameKeyword));
    // });

    // it('when found term in description', function() {
    //   const coloredResponse = socketSearch.colorResponse(itemInfoObject.description, lowerCasedNameKeyword);
    //
    //   expect(coloredResponse.toLowerCase()).to.contain(format.green(lowerCasedNameKeyword));
    // });

    it('is not applied when term is not found in author', function () {
      const coloredResponse = socketSearch.colorResponse(itemInfoObject.author, lowerCasedNameKeyword)

      expect(coloredResponse.toLowerCase()).to.not.contain(format.green(lowerCasedNameKeyword))
    })

    it('is not applied when term is not found in version', function () {
      const coloredResponse = socketSearch.colorResponse(itemInfoObject.version, lowerCasedNameKeyword)

      expect(coloredResponse).to.not.contain(format.green(lowerCasedNameKeyword))
    })

    // it('when found term in tags', function() {
    //   const coloredResponse = socketSearch.colorResponse(itemInfoObject.tag, lowerCasedNameKeyword);
    //
    //   expect(coloredResponse.toLowerCase()).to.contain(format.green(lowerCasedNameKeyword));
    // });
  })
})
