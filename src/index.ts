const osc = require('osc');
import 'core-js';
import { resolve } from 'path';

/**
 * @class
 * @classdesc the main entry point for qlab-js. Use an
 */
/* eslint-disable no-class-assign */
// eslint-disable-next-line
export default class Qlab {
  udpPort: any;
  messageListeners: MessageListener[];

  constructor(targetIP: any) {
    console.log(osc);
    this.udpPort = new osc.UDPPort({
      localAddress: '0.0.0.0',
      localPort: 53001,
      remoteAddress: targetIP,
      remotePort: 53000,
      metadata: true,
    });

    this.messageListeners = [];

    this.udpPort.on('message', (oscMsg: QlabResponse, timeTag: any, info: any) => {
      this.handleIncomingMessage(oscMsg, timeTag, info);
    });

    this.udpPort.open();
  }

  /**
   * Adds messageListener to the messageListeners array. Used to type check :)
   * @param urlRegEx the expression the url should match against
   * @param callback the function that should be called when
   */
  createMessageListener = async (messageListener: MessageListener) => {
    console.log(messageListener);
    this.messageListeners.push(messageListener);
  };

  /**
   * This function handles all messages received. Should not be called manually
   * @param oscMsg The message
   * @param timeTag The Timetag
   * @param info the info
   */
  async handleIncomingMessage(oscMsg: QlabResponse, timeTag: any, info: object) {
    console.log(oscMsg);
    this.messageListeners.forEach((messageListener) => {
      if (messageListener.urlRegEx.test(oscMsg.address)) {
        messageListener.callback(oscMsg.args);
      }
    });
  }

  /**
   * returns all cuelists in qlab
   */
  getLists() {
    return new Promise((resolve, reject) => {
      this.udpPort.send({
        address: '/cueLists',
      });
      var regEx = /(\/workspace\/....................................\/cueLists)/gi;
      this.createMessageListener({
        urlRegEx: regEx,
        callback: (data: any) => {
          console.log(data);
          resolve(data);
        },
      });
    });
  }
}

/**
 * Creates the message listener type.
 * Every time a new message comes in the class checks each regex if it matches,
 * If it does match it calls the callback function
 */
type MessageListener = {
  urlRegEx: RegExp;
  callback: Function;
};

type QlabResponse = {
  workspace_id: string | undefined;
  address: string;
  args: object;
};
