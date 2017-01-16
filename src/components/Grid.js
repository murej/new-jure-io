import React, { Component } from 'react';
import cx from 'classnames';
import isEmpty from 'lodash/isEmpty';

import '../styles/Grid.scss';

class Grid extends Component {
  render() {
    const className = this.props.className
    const hasClassName = !isEmpty(className)
    const isWide = this.props.size === "wide";

    const classNames = cx({
      "Grid": true,
      "Grid--flex": this.props.flex,
      "Grid--wide": isWide,
      [className]: hasClassName
    });
    return (
      <div className={classNames}>
        {!isWide &&
          <div className="Grid-Margin">
            <div className="Grid-Gutter"></div>
          </div>
        }
        <div className="Grid-ContentWrapper">
          <div className="Grid-Content">
            {this.props.children}
          </div>
        </div>
        {!isWide &&
          <div className="Grid-Margin">
            <div className="Grid-Gutter"></div>
          </div>
        }
      </div>
    );
  }
}

Grid.displayName = 'Grid';

// Uncomment properties you need
Grid.propTypes = {
  flex: React.PropTypes.bool,
  size: React.PropTypes.string,
  className: React.PropTypes.string
};
Grid.defaultProps = {
  flex: false,
  size: "normal"
};

export default Grid;
