import Vue from 'vue'
import { Row, Col } from 'iview/src/components/grid'
import { Select, Option, OptionGroup } from 'iview/src/components/select'
import ExternalLink from './ExternalLink'
import ModuleHeader from './ModuleHeader'
import '../assets/custom.less'

import {
  Alert,
  AutoComplete,
  Avatar,
  Button,
  Card,
  Checkbox,
  Dropdown,
  Form,
  Icon,
  Input,
  InputNumber,
  Menu,
  Message,
  Modal,
  Tabs,
  Table,
  Tag,
  Tree,
  Tooltip,
  Poptip,
  Spin
} from 'iview'

const components = {
  Alert,
  AutoComplete,
  Avatar,
  Button,
  ButtonGroup: Button.Group,
  Card,
  Checkbox,
  Col,
  Dropdown,
  DropdownMenu: Dropdown.Menu,
  DropdownItem: Dropdown.Item,
  Form,
  FormItem: Form.Item,
  Icon,
  Input,
  InputNumber,
  Menu,
  MenuItem: Menu.Item,
  Message,
  Modal,
  Option,
  OptionGroup,
  Row,
  Select,
  Tabs,
  TabPane: Tabs.Pane,
  Table,
  Tag,
  Tree,
  Tooltip,
  Poptip,
  Spin
}

Object.keys(components).forEach(key => {
  if (process.env.NODE !== 'production') {
    console.log('i' + key)
  }
  Vue.component('i' + key, components[key])
})

Vue.prototype.$Message = Message
Vue.component('ExternalLink', ExternalLink)
Vue.component('ModuleHeader', ModuleHeader)
