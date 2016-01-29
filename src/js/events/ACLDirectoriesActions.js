import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from './AppDispatcher';
import Config from '../config/Config';
import RequestUtil from '../utils/RequestUtil';

const ACLDirectoriesActions = {

  fetchDirectories: function () {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/ldap/config`,
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_ACL_DIRECTORIES_SUCCESS,
          // TODO: Remove this array, currently we're forcing an array
          // even though the API is only storing one directory
          data: [response]
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_ACL_DIRECTORIES_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  addDirectory: function (data) {
    data.port = parseInt(data.port, 10);

    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/ldap/config`,
      method: 'PUT',
      data,
      success: function () {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_ADD_SUCCESS
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_ADD_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  },

  deleteDirectory: function () {
    RequestUtil.json({
      url: `${Config.rootUrl}${Config.acsAPIPrefix}/ldap/config`,
      method: 'DELETE',
      success: function () {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_DELETE_SUCCESS
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_ACL_DIRECTORY_DELETE_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr)
        });
      }
    });
  }

};

module.exports = ACLDirectoriesActions;