import {DefaultRoute, Redirect, Route} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import HostTable from '../components/HostTable';
import NodeDetailBreadcrumb from '../pages/nodes/breadcrumbs/NodeDetailBreadcrumb';
import NodeDetailPage from '../pages/nodes/NodeDetailPage';
import NodesGridView from '../components/NodesGridView';
import NodesPage from '../pages/NodesPage';
import TaskDetail from '../../../plugins/services/src/js/pages/task-details/TaskDetail';
import TaskDetailBreadcrumb from '../../../plugins/services/src/js/pages/nodes/breadcrumbs/TaskDetailBreadcrumb';
import TaskDetailsTab from '../../../plugins/services/src/js/pages/task-details/TaskDetailsTab';
import TaskFilesTab from '../../../plugins/services/src/js/pages/task-details/TaskFilesTab';
import TaskLogsTab from '../../../plugins/services/src/js/pages/task-details/TaskLogsTab';
import UnitsHealthNodeDetail from '../pages/system/UnitsHealthNodeDetail';
import UnitsHealthDetailBreadcrumb from '../pages/system/breadcrumbs/UnitsHealthDetailBreadcrumb';
import VolumeDetail from '../../../plugins/services/src/js/components/VolumeDetail';
import VolumeTable from '../../../plugins/services/src/js/components/VolumeTable';

let nodesRoutes = {
  type: Route,
  name: 'nodes',
  children: [
    {
      type: Route,
      name: 'nodes-page',
      path: '/nodes/?',
      handler: NodesPage,
      buildBreadCrumb() {
        return {
          getCrumbs() {
            return [
              {
                label: 'Nodes',
                route: {to: 'nodes-page'}
              }
            ];
          }
        };
      },
      children: [
        {
          type: Route,
          name: 'nodes-list',
          path: 'list/?',
          handler: HostTable
        },
        {
          type: Route,
          name: 'nodes-grid',
          path: 'grid/?',
          handler: NodesGridView
        },
        {
          type: Redirect,
          from: '/nodes/?',
          to: 'nodes-list'
        }
      ]
    },
    {
      type: Route,
      name: 'node-detail',
      path: ':nodeID/?',
      handler: NodeDetailPage,
      hideHeaderNavigation: true,
      buildBreadCrumb() {
        return {
          parentCrumb: 'nodes-page',
          getCrumbs(router) {
            return [
              <NodeDetailBreadcrumb
                parentRouter={router}
                routeName="node-detail" />
            ];
          }
        };
      },
      children: [
        // This route needs to be rendered outside of the tabs that are rendered
        // in the nodes-task-details route.
        {
          type: Route,
          name: 'item-volume-detail',
          path: ':nodeID/tasks/:taskID/volumes/:volumeID/?',
          handler: VolumeDetail,
          buildBreadCrumb() {
            return {
              parentCrumb: 'node-detail',
              getCrumbs(router) {
                return [
                  {
                    label: 'Volumes',
                    route: {
                      params: router.getCurrentParams(),
                      to: 'nodes-task-details-volumes'
                    }
                  },
                  {
                    label: router.getCurrentParams().volumeID
                  }
                ];
              }
            };
          }
        },
        {
          type: Route,
          path: 'tasks/:taskID/?',
          name: 'nodes-task-details',
          handler: TaskDetail,
          hideHeaderNavigation: true,
          buildBreadCrumb() {
            return {
              parentCrumb: 'node-detail',
              getCrumbs(router) {
                return [
                  <TaskDetailBreadcrumb
                    parentRouter={router}
                    routeName="nodes-task-details" />
                ];
              }
            };
          },
          children: [
            {
              type: DefaultRoute,
              name: 'nodes-task-details-tab',
              handler: TaskDetailsTab,
              hideHeaderNavigation: true,
              buildBreadCrumb() {
                return {
                  parentCrumb: 'nodes-task-details',
                  getCrumbs() { return []; }
                };
              },
              title: 'Details'
            },
            {
              type: Route,
              name: 'nodes-task-details-files',
              path: 'files/?',
              handler: TaskFilesTab,
              hideHeaderNavigation: true,
              logRouteName: 'nodes-task-details-logs',
              buildBreadCrumb() {
                return {
                  parentCrumb: 'nodes-task-details',
                  getCrumbs() { return []; }
                };
              },
              title: 'Files'
            },
            {
              type: Route,
              name: 'nodes-task-details-logs',
              dontScroll: true,
              path: 'logs/:filePath?/?:innerPath?/?',
              handler: TaskLogsTab,
              hideHeaderNavigation: true,
              buildBreadCrumb() {
                return {
                  parentCrumb: 'nodes-task-details',
                  getCrumbs() { return []; }
                };
              },
              title: 'Logs'
            },
            {
              type: Route,
              name: 'nodes-task-details-volumes',
              path: 'volumes/:volumeID?',
              handler: VolumeTable,
              buildBreadCrumb() {
                return {
                  parentCrumb: 'nodes-task-details',
                  getCrumbs() { return []; }
                };
              },
              title: 'Volumes'
            }
          ]
        },
        {
          type: Route,
          name: 'node-detail-health',
          path: ':nodeID/:unitNodeID/:unitID/?',
          handler: UnitsHealthNodeDetail,
          buildBreadCrumb() {
            return {
              parentCrumb: 'node-detail',
              getCrumbs(router) {
                return [
                  <UnitsHealthDetailBreadcrumb
                    parentRouter={router}
                    routeName="node-detail-health"
                    />
                ];
              }
            };
          }
        }
      ]
    }
  ]
};

module.exports = nodesRoutes;
