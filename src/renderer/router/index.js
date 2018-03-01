import Vue from 'vue'
import Router from 'vue-router'
import Overview from '../views/Overview'
import Projects from '../views/Projects'
import ProjectEdit from '../views/ProjectEdit'
import ProjectLog from '../views/ProjectLog'
import Git from '../views/Git'
import Settings from '../views/Settings'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'overview',
      component: Overview
    },
    {
      path: '/projects',
      name: 'projects',
      component: Projects
    },
    {
      path: '/projects/add',
      name: 'project-add',
      component: ProjectEdit
    },
    {
      path: '/projects/edit',
      name: 'project-edit',
      component: ProjectEdit
    },
    {
      path: '/projects/log',
      name: 'project-log',
      component: ProjectLog
    },
    {
      path: '/git',
      name: 'git',
      component: Git
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
