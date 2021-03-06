import classNames from 'classnames';
import React from 'react';

import BarChart from './BarChart';
import Chart from './Chart';
import ResourcesUtil from '../../utils/ResourcesUtil';

// number to fit design of width vs. height ratio
const WIDTH_HEIGHT_RATIO = 4.5;

let ResourceBarChart = React.createClass({

  displayName: 'ResourceBarChart',

  propTypes: {
    onResourceSelectionChange: React.PropTypes.func.isRequired,
    itemCount: React.PropTypes.number.isRequired,
    resources: React.PropTypes.object.isRequired,
    refreshRate: React.PropTypes.number.isRequired,
    resourceType: React.PropTypes.string,
    selectedResource: React.PropTypes.string.isRequired,
    totalResources: React.PropTypes.object.isRequired
  },

  getDefaultProps() {
    return {
      itemCount: 0,
      totalResources: {},
      y: 'percentage',
      refreshRate: 0,
      resourceType: ''
    };
  },

  getData() {
    let props = this.props;

    if (props.itemCount === 0) {
      return [];
    }

    let selectedResource = props.selectedResource;
    return [{
      id: 'used_resources',
      name: selectedResource + ' allocated',
      colorIndex: ResourcesUtil.getResourceColor(selectedResource),
      values: props.resources[selectedResource]
    }];
  },

  getMaxY() {
    if (this.props.totalResources[this.props.selectedResource]) {
      return 100;
    } else {
      return 0;
    }
  },

  handleSelectedResourceChange(selectedResource) {
    this.props.onResourceSelectionChange(selectedResource);
  },

  getModeButtons() {
    let selectedResource = this.props.selectedResource;

    let resourceColors = ResourcesUtil.getResourceColors();
    let resourceLabels = ResourcesUtil.getResourceLabels();

    return ResourcesUtil.getDefaultResources().map((resource) => {
      let classSet = classNames('button button-stroke button-inverse', {
        'active': selectedResource === resource
      });

      return (
        <button
            key={resource}
            className={`${classSet} path-color-${resourceColors[resource]}`}
            onClick={this.handleSelectedResourceChange.bind(this, resource)}>
          {resourceLabels[resource]}
        </button>
      );
    });
  },

  getBarChart() {
    return (
      <Chart calcHeight={function (w) { return w / WIDTH_HEIGHT_RATIO; }}>
        <BarChart
          data={this.getData()}
          maxY={this.getMaxY()}
          ticksY={4}
          y={this.props.y}
          refreshRate={this.props.refreshRate} />
      </Chart>
    );
  },

  getHeadline(resource) {
    let label = ResourcesUtil.getResourceLabel(resource);
    let headline = `${label} Allocation Rate`;

    return (
      <div>
        <h4 className="flush inverse">
          {headline}
        </h4>
        <p className="flush inverse">
          {this.props.itemCount + ' Total ' + this.props.resourceType}
        </p>
      </div>
    );
  },

  render() {
    return (
      <div className="chart panel panel-inverse">
        <div className="panel-header panel-header-large no-border flush-bottom">
          <div className="panel-options button-group">
            {this.getModeButtons()}
          </div>
          <div className="inverse">
            {this.getHeadline(this.props.selectedResource)}
          </div>
        </div>
        <div className="panel-content" ref="panelContent">
          {this.getBarChart()}
        </div>
      </div>
    );
  }
});

module.exports = ResourceBarChart;
