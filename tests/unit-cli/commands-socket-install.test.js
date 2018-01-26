
// import { expect } from 'chai';
// import sinon from 'sinon'
// import sinonTestFactory from 'sinon-test'
// sinon.test = sinonTestFactory(sinon);
// import format from 'chalk';
// import SocketInstall from './socket-install';
// import context from '../utils/context';
// import printTools from '../utils/print-tools';
// import requests from '../utils/requests';
// import { getRandomString } from '../utils/test-utils';

// describe('[commands] Install Socket', function() {
//   const socketInstall = new SocketInstall(context);
//   const serverResolveResponse = {
//     data: {
//       version: '0.1',
//       name: 'segment'
//     }
//   };

//   let echo = null;
//   let error = null;

//   before(function() {
//     echo = sinon.stub(printTools, 'echo');
//     error = sinon.stub(printTools, 'error');
//     sinon.stub(socketInstall.session, 'load');
//   });

//   after(function() {
//     printTools.echo.restore();
//     printTools.error.restore();
//     socketInstall.session.load.restore();
//   });

//   describe('with parameter', function() {
//     let install = null;

//     before(function() {
//       sinon.stub(requests, 'searchSocketByName').returns(Promise.resolve(serverResolveResponse));
//       install = sinon.stub(socketInstall.Socket, 'install');
//     });

//     after(function() {
//       socketInstall.Socket.install.restore();
//     });

//     it('should call Socket install method with proper argument', sinon.test(async function() {
//       await socketInstall.run(['Segment', {}]);

//       sinon.assert.calledWith(install, serverResolveResponse.data);
//     }));

//     it('should print installed socket console response', async function() {
//       const expectedResponse = `\n${format.green(`Socket ${serverResolveResponse.data.name} has been successfully installed.`)}\n`;

//       await socketInstall.run(['Segment', {}]);

//       sinon.assert.calledWith(echo, expectedResponse);
//     });

//     it('should return socket', async function() {
//       const socket = await socketInstall.run(['Segment', {}]);
//       requests.searchSocketByName.restore();

//       expect(socket).to.be.equal(serverResolveResponse.data);
//     });

//     it('should return error if searchSocketByName reject', sinon.test(async function() {
//       const responseError = getRandomString();
//       this.stub(requests, 'searchSocketByName').returns(Promise.reject(responseError));

//       await socketInstall.run(['Segment', {}]);

//       sinon.assert.calledWith(echo, `\n${format.red(responseError)}\n`);
//     }));
//   });

//   describe('without parameter', function() {
//     it('should throw error', function() {
//       socketInstall.run([undefined, {}]);

//       sinon.assert.calledWith(error, 'Socket name is a required parameter!');
//     });
//   });
// });
