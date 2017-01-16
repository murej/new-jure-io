import React, { Component } from 'react';
import AIClient from '../AIClient';
import uuid from 'uuid';
import Typist from 'react-typist';
import Textarea from 'react-textarea-autosize';
import isEmpty from 'lodash/isEmpty';

import '../styles/Dialogue.scss';

import Grid from './Grid';

import Scripts from '../data/scripts';
import Suggestions from '../data/suggestions';

const AI = new AIClient(uuid());

class Dialogue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOtherTyping: false,
      messages: [],
      messageQueue: [],
      isAnimating: false
    }
    this.messageListRef = null;
    this.isOtherTypingTimeout = null;
  }

  componentWillMount() {
    this._queueMessages(this._createBotMessages(Scripts.intro));
  }

  render() {
    const inputSuggestion = Suggestions.general[Math.floor(Math.random()*Suggestions.general.length)];
    const userInputField =
      <div
        contentEditable
        className={'Dialogue-UserInputField'}
        onKeyDown={this._handleOnUserInputChange}
        onBlur={(e) => e.target.focus()}
        placeholder={'e.g. '+inputSuggestion}
      />;

    return (
      <div className="Dialogue">
        <Grid>
          <div
            className="Dialogue-MessageList"
            ref={(messageList) => { this.messageListRef = messageList; }}
          >
            {this.state.messages}
          </div>
          {!this.state.isOtherTyping && userInputField}
        </Grid>
      </div>
    );
  }

  componentDidMount() {
    this._checkMessageQueue();
  }

  componentDidUpdate() {
    if(this.state.isOtherTyping && !this.state.isAnimating) {
      this.setState({
        isOtherTyping: false
      })
    }
    // else {
      this._checkMessageQueue();
    // }
  }

  componentWillUnmount() {
    clearTimeout(this.isOtherTypingTimeout);
  }

  _queueMessages(messages) {
    const messageQueue = this.state.messageQueue.slice(0);

    const arrayedMessages = Array.isArray(messages) ? messages : [messages];
    arrayedMessages.forEach((message) => messageQueue.push(message));

    this.setState({ messageQueue: messageQueue });
  }

  _checkMessageQueue() {
    const messageQueue = this.state.messageQueue.slice();
    const hasMessagesQueued = !isEmpty(messageQueue);
    const isOtherTyping = this.state.isOtherTyping;

    if(hasMessagesQueued && !isOtherTyping) {
      this._showNextMessage();
    }
  }

  _showNextMessage() {
    const messageQueue = this.state.messageQueue.slice();
    const nextMessage = messageQueue.shift();

    const isAnimated = nextMessage.animate;
    let newMessage = <p key={uuid()}>{nextMessage.text}</p>;

    if(isAnimated) {
      newMessage =
        <Typist
          key={uuid()}
          avgTypingDelay={50 /* 75 */}
          stdTypingDelay={30 /* 25 */}
          cursor={{ show: false }}
          onTypingDone={this._handleOnBotDone}
        >
          {newMessage}
        </Typist>;
    }

    const messages = this.state.messages.slice(0);
    messages.push(newMessage);

    this.setState({
      messages: messages,
      messageQueue: messageQueue,
      isOtherTyping: true,
      isAnimating: isAnimated
    });
  }

  _handleOnBotDone = (delay = 500) => {
    window.scrollTo(0, this.messageListRef.getBoundingClientRect().bottom);
    this.isOtherTypingTimeout = setTimeout(() => {
      this.setState({
        isAnimating: false
      })
    }, delay)
  }

  _handleBotResponse = (response) => {
    const fulfillment = response.fulfillment;
    const isValid = !isEmpty(fulfillment.speech);
    if(isValid) {
      const speech = {
        text: fulfillment.speech,
        animate: true
      };
      let messages = fulfillment.messages;
      const hasMessages = !isEmpty(messages);
      messages = !hasMessages ? speech : messages.map((message) => {
        switch(message.type) {
          /* speech*/
          case 0:
            return {
              text: message.speech,
              animate: true
            };
            break;
          /* image with title */
          case 1:
            return {
              text: message.title + ' (image with title)',
              animate: true
            };
            break;
          /* quick response (buttons) */
          case 2:
            return {
              text: message.title + ' (quick response)',
              animate: true
            };
            break;
          /* image */
          case 3:
            return {
              text: message.imageUrl + ' (image)',
              animate: true
            }
            break;
          default:
            console.warn('no message type defined', response);
            return {
              text: 'Whoa?',
              animate: true
            };
        }
      });

      this._queueMessages(messages);
    }
    else {
      console.warn('not a valid response', response);
    }
  }

  _createBotMessages(messages) {
    const arrayedMessages = Array.isArray(messages) ? messages : [messages];
    const botMessages = arrayedMessages.map((text) => {
      return {
        text: text,
        animate: true
      }
    });
    return botMessages;
  }

  _handleOnUserInputChange = (event) => {
    const value = event.target.value;
    const hasValue = !isEmpty(value);
    const isSubmit = event.key === 'Enter';

    (isSubmit && hasValue) && this._submitUserInput(value);
  }

  _submitUserInput = (text) => {
    const message = {
      text: `> ${text}`,
      animate: false
    }
    this._queueMessages(message);

    AI.sendMessage(text)
        .then((response) => {
          this._handleBotResponse(response);
        })
        .catch((error) => {
          console.warn(error);
        })
  }
}

export default Dialogue;
