jest.dontMock('../../components/charts/Chart');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../../mixins/InternalStorageMixin');
jest.dontMock('../../mixins/TabsMixin');
jest.dontMock('../../stores/MesosSummaryStore');
jest.dontMock('../nodes/NodeDetailPage');
jest.dontMock('../../components/RequestErrorMsg');
jest.dontMock('../../structs/CompositeState');

const JestUtil = require('../../utils/JestUtil');

JestUtil.unMockStores(['MesosSummaryStore', 'MesosStateStore']);
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');

const CompositeState = require('../../structs/CompositeState');
const MesosStateStore = require('../../stores/MesosStateStore');
const MesosSummaryActions = require('../../events/MesosSummaryActions');
const MesosSummaryStore = require('../../stores/MesosSummaryStore');
const Node = require('../../structs/Node');
const NodesList = require('../../structs/NodesList');
const NodeDetailPage = require('../nodes/NodeDetailPage');

describe('NodeDetailPage', function () {
  beforeEach(function () {
    this.fetchSummary = MesosSummaryActions.fetchSummary;
    this.getTasksFromNodeID = MesosStateStore.getTasksFromNodeID;
    this.storeGet = MesosStateStore.get;
    this.storeGetNode = MesosStateStore.getNodeFromID;
    this.getNodesList = CompositeState.getNodesList;

    this.container = document.createElement('div');

    CompositeState.getNodesList = function () {
      return new NodesList({items: [{id: 'existingNode'}]});
    };

    MesosSummaryActions.fetchSummary = function () {
      return null;
    };
    MesosStateStore.getTasksFromNodeID = function () {
      return [];
    };

    MesosStateStore.get = function (key) {
      if (key === 'lastMesosState') {
        return {
          version: '1'
        };
      }

    };

    MesosStateStore.getNodeFromID = function (id) {
      if (id === 'nonExistent') {
        return null;
      }

      return {
        id: 'existingNode',
        version: '10',
        active: true,
        registered_time: 10
      };
    };
    MesosSummaryStore.init();
    MesosSummaryStore.processSummary({
      slaves: [
        {
          'id': 'foo',
          'hostname': 'bar'
        },
        {
          id: 'existingNode',
          version: '10',
          active: true,
          registered_time: 10,
          sumTaskTypesByState() { return 1; }
        }
      ]
    });
  });

  afterEach(function () {
    MesosSummaryActions.fetchSummary = this.fetchSummary;
    MesosStateStore.getTasksFromNodeID = this.getTasksFromNodeID;
    MesosStateStore.get = this.storeGet;
    MesosStateStore.getNodeFromID = this.storeGetNode;
    MesosStateStore.removeAllListeners();
    MesosSummaryStore.removeAllListeners();
    ReactDOM.unmountComponentAtNode(this.container);
    CompositeState.getNodesList = this.getNodesList;
  });

  describe('#getNode', function () {

    it('should store an instance of Node', function () {
      var instance = ReactDOM.render(
        <NodeDetailPage params={{nodeID: 'existingNode'}} />,
        this.container
      );

      var node = instance.getNode();
      expect(node instanceof Node).toEqual(true);
      instance = null;
    });

  });

  describe('#renderDetailsTabView', function () {

    it('should return null if node does not exist', function () {
      var instance = ReactDOM.render(
        <NodeDetailPage params={{nodeID: 'nonExistent'}} />,
        this.container
      );

      var result = instance.renderDetailsTabView();
      expect(result).toEqual(null);
    });

    it('should return a node if node exists', function () {
      var instance = ReactDOM.render(
        <NodeDetailPage params={{nodeID: 'existingNode'}} />,
        this.container
      );

      var result = instance.renderDetailsTabView();
      expect(TestUtils.isElement(result)).toEqual(true);
    });
  });

});
