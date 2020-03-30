import React from 'react';
import { Board, BoardNotifications } from './Board.js';
import { RecommendBox, RecommendBoxNotifications } from './RecommendBox.js';
import './App.css';
import natural from 'natural';
import Dialog from 'react-bootstrap-dialog';

const Immutable = require('immutable');

function App() {
  // needed for recommend.js
  natural.LancasterStemmer.attach();

  return (
    <Game ref={(gameComponent) => { window.gameComponent = gameComponent }} />
  );
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      game: null,
    };
  }

  updateStateFromLegacyRender(game) {
    this.setState({ 'game': Object.assign({}, game) });
  }

  render() {
    const game = this.state.game || {};
    return (
      <div>
        <NavBar enable_auto_clues={game.enable_auto_clues} all_revealed={game.allrevealed} />
        <AboutModal />
        <SettingsModal />
        <GamePanel game={this.state.game} />
      </div>
    );
  }
}

class GamePanel extends React.Component {
  render() {
    const game = this.props.game;

    if (game === null) {
      return <div />;
    } else if (game.error !== null) {
      return <p className="lead"> {game.error}</p>;
    } else {
      return (
        <div>
          <div>
            <RecommendBoxNotifications game={game} />
            <BoardNotifications game={game} />
          </div>
          <div className="container-fluid h-100">
            <div className="row h-100">
              <RecommendBox game={game} />
              <Board game={game} />
            </div>
          </div>
        </div>
      );
    }
  }
}


function AboutModal() {
  return (<div className="modal fade" id="about-modal" tabIndex="-1" role="dialog" aria-labelledby="about-modal-label" aria-hidden="true">
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title" id="about-modal-label">About Words</h5>
          <button type="button" className="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <p>Simple website to keep track of codenames-like game.</p>

          <p>To see all words select <b>Give Clues</b> from <b>Game Mode</b>.</p>

          <p>Type the same <b>seed</b> on a different device to get the same words.</p>

          <p>The clues can be suggested by the computer automatically. Just select <b>Auto Clues</b> from <b>Game Mode</b>. In this mode you can play the game with just two people!</p>

          <p>If you don't want the computer to completely take over, you can just look at its suggestions and pick the clue yourself. Just select <b>Assisted Clues</b> from <b>Game Mode</b>.</p>
        </div>
        <div className="modal-footer">
          <a className="btn btn-info" href="https://en.wikipedia.org/wiki/Codenames_(board_game)">Rules</a>
          <a className="btn btn-info" href="https://github.com/siemanko/words2/">Source</a>
        </div>
      </div>
    </div>
  </div>
  );
}

class SettingsModal extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
      var self = this;
      function reset_settings() {

          self.dialog.show({
              body: (<div className="text-center delete-clue-confirm">
                        <span>Are you want to reset settings to default? This cannot be undone.</span>
                    </div>),
              actions: [
                  Dialog.CancelAction(),
                  Dialog.OKAction(function() {
                      sessionStorage.removeItem('storage_version');
                      window.location.reload();
                  })
              ],
              bsSize: 'small',
          });
      }

      return (<div className="modal fade" id="settings-modal" tabIndex="-1" role="dialog" aria-labelledby="settings-modal-label" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="about-modal-label">Settings</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label className="text-justify">
                    Double click to reveal a word<br />
                    <small>Do you sometimes accidentally reveal a word because of your clumsy laptop touchpad? This option might be for you!.</small>
                  </label>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="" id="double-click" />
                    <label className="form-check-label" htmlFor="double-click">
                      require double click / tap to reveal a word
                    </label>
                  </div>
                </div>
                <hr />
                <div className="form-group">
                  <label htmlFor="risk" className="text-justify">
                    Language
                  </label>
                  <select className="form-control" id="lang">
                    <option value="en">English</option>
                    <option value="pl">Polish</option>
                    <option value="he">Hebrew (by Yonatan Zax)</option>
                  </select>
                </div>
                <hr />
                <div className="form-group">
                  <label className="text-justify">
                    Use only popular words<br />
                    <small>The model can produce clues based on pretty large dictionary of words - about 30k - this allows it to sometimes find an original and awesome hint
                      for a board where human might think that all hope is lost. However, this comes at a price - the clues can sometimes be unusual, offensive, hard to understrand or even google!
                      If this is too much for you consider the option below. </small>
                  </label>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="" id="use-common-words" />
                    <label className="form-check-label" htmlFor="use-common-words">
                      Keep it simple
                    </label>
                  </div>
                </div>
                <hr />

                <div className="form-group">
                  <label htmlFor="risk" className="text-justify">
                    Risk tolerance<br />
                    <small>The number of bad words that are ignored when coming up with clues. Zeros words is the safest option, but might sometimes result in more awkward clues.</small>
                  </label>
                  <select className="form-control" id="risk">
                    <option value="0">zero words</option>
                    <option value="1">one word</option>
                    <option value="2">two words</option>
                    <option value="3">three words</option>
                    <option value="allbutblack">all words (no black)</option>
                    <option value="all">all words (including black)</option>
                  </select>
                </div>
                <hr />

                <div className="form-group">
                  <label className="text-justify">
                    AI Model Statistics<br />
                    <small>Displays information about the automatic clue suggestion model, e.g. which words is the clue related to or what is its score.</small>
                  </label>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="" id="debug-enable" disabled />
                    <label className="form-check-label" htmlFor="debug-enable">
                      I want to know everything! <i>(coming soon!)</i>
                    </label>
                  </div>
                </div>
                <hr />
                <div className="form-group">
                  <label className="text-justify">
                    Reset all settings<br />
                    <small>Reset all settings to their default. Useful when something breaks.</small>
                  </label>
                  <input type="button" className="btn btn-secondary btn-small w-100" id="reset-settings" value="Reset" onClick={reset_settings} data-dismiss="modal"></input>
                  <Dialog ref={(component) => { this.dialog = component;}} />
                </div>
              </form>

            </div>

          </div>
        </div>
      </div>
      );
    }
}

class NavBar extends React.Component {
  render() {
    return (
      <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light" id="main-navbar">
        <a className="navbar-brand" href="http://clues.fun/">
          clues.fun
          &nbsp;
          <small id="red-left" style={{ color: 'red' }}></small>
          &nbsp;
          <small id="blue-left" style={{ color: 'blue' }}></small>
          &nbsp;
          &nbsp;
          &nbsp;

        </a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#menu" aria-controls="menu" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="menu">
          {/* navigation buttons */}
          <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
            {/* game modes  */}
            <li className="nav-item dropdown">
              <a className="nav-link" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <img src="icons/detective.svg" className="navbar-icon" />&nbsp;Game Mode
            </a>
              <div className="dropdown-menu">
                <h6 class="dropdown-header">Classic</h6>
                <a className={(!this.props.enable_auto_clues && !this.props.all_revealed) ? "dropdown-item active" : "dropdown-item"} href="#" id="guess">
                  <img src="icons/guess.svg" className="navbar-icon" />&nbsp;Guess
                </a>
                <a className={(!this.props.enable_auto_clues && this.props.all_revealed) ? "dropdown-item active" : "dropdown-item"} href="#" id="cluemaster">
                  <img src="icons/detective.svg" className="navbar-icon" />&nbsp;Give&nbsp;Clues
                </a>
                <h6 class="dropdown-header">New (beta)</h6>
                <a className={(this.props.enable_auto_clues && !this.props.all_revealed) ? "dropdown-item active" : "dropdown-item"} href="#" id="auto-cluemaster">
                  <img src="icons/ai2.svg" className="navbar-icon" />&nbsp;Auto&nbsp;Clues
                </a>
                <a className={(this.props.enable_auto_clues && this.props.all_revealed) ? "dropdown-item active" : "dropdown-item"} href="#" id="assist-cluemaster">
                  <img src="icons/ai.svg" className="navbar-icon" />&nbsp;Assisted&nbsp;Clues
                </a>
              </div>
            </li>

            {/* reset  */}
            <li className="nav-item"><a href='#' id="reset" className="nav-link">
              <img src="icons/reset.svg" className="navbar-icon" />&nbsp;Reset
            </a>
            </li>


            {/* settings */}
            <li className="nav-item"><a href='#' id="about" className="nav-link" data-toggle="modal" data-target="#settings-modal">
              <img src="icons/settings.svg" className="navbar-icon" />&nbsp;Settings
            </a>
            </li>

            {/* donate */}
            <li className="nav-item"><a href='https://www.patreon.com/words2' id="patreon" className="nav-link">
              <img src="icons/money.svg" className="navbar-icon" />&nbsp;Donate
            </a></li>

            {/* about */}
            <li className="nav-item"><a href='#' id="about" className="nav-link" data-toggle="modal" data-target="#about-modal">
              <img src="icons/info.svg" className="navbar-icon" />&nbsp;About
            </a>
            </li>




          </ul>

          {/* seed input */}
          <form className="form-inline my-2 my-lg-0">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon1">seed</span>
              </div>
              <input className="form-control" type="text" className="form-control" id="seed"
                placeholder="seed" data-toggle="tooltip" data-placement="bottom" title="Type this on a different device to get the same game" />
            </div>
          </form>

        </div >
      </nav >
    );
  }
}

export default App;
