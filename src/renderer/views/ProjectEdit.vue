<template>
  <div class="project-edit">
    <module-header>
      {{isEdit?'项目编辑':'项目新增'}}
    </module-header>
    <i-form ref="form" :model="form" :label-width="80">
      <div v-for="(project,index) in form.projects" :key="project.path"
        class="flex flex-ai-center my-1 project">
        <div class="flex-1 px-1 py-1" :class="{'border-1px-r':!isEdit}">
          <div class="flex">
            <i-form-item class="flex-1" label="项目目录" :prop="`projects.${index}.path`"
              :rules="{required:true, message: '请选择项目目录'}">
              <div class="flex">
                <i-input v-model="project.path" readonly placeholder="请选择项目目录"/>
                <i-button type="primary" @click="selectPath(project, index)" style="margin-left:4px">选择目录</i-button>
              </div>
            </i-form-item>
            <i-form-item label="项目名称" :prop="`projects.${index}.name`"
              :rules="{required:true, message: '项目名称必填'}">
              <i-input v-model="project.name" placeholder="请输入项目名称"></i-input>
            </i-form-item>
          </div>
          <div v-for="(script, scriptIndex) in project.scripts" :key="scriptIndex" class="flex">
            <i-form-item class="flex-1" :label="scriptIndex===0?'执行脚本':''" :prop="`projects.${index}.scripts.${scriptIndex}`"
              :rules="[{required:true, message: '执行脚本必填'}, {validator:(rule,value,cb) => getScriptRule(index, scriptIndex, value, cb)}]">
              <i-input :value="script" @input="v=>updateScript(project.scripts, scriptIndex, v)"
                placeholder="请输入要执行的脚本指令"></i-input>
            </i-form-item>
            <i-button-group class="ml-2">
              <i-button :disabled="project.scripts.length<2" icon="minus"
                @click="project.scripts.splice(scriptIndex,1)"></i-button>
              <i-button icon="plus" v-if="scriptIndex===project.scripts.length-1"
                @click="addScript(project.scripts, index)"></i-button>
            </i-button-group>
          </div>
        </div>
        <i-button-group v-if="!isEdit" class="px-1">
          <i-button :disabled="form.projects.length<2" icon="minus"
            @click="form.projects.splice(index,1)"></i-button>
          <i-button :disabled="index===0" icon="arrow-up-c"
            @click="up(index)"></i-button>
          <i-button :disabled="index===form.projects.length - 1" icon="arrow-down-c"
            @click="down(index)"></i-button>
        </i-button-group>
      </div>
      <i-form-item>
        <template v-if="!isEdit">
          <i-button type="info" icon="plus" @click="add">继续添加</i-button>
          <span class="mx-1">或</span>
        </template>
        <i-button type="primary" icon="checkmark" @click="save">保存</i-button>
      </i-form-item>
    </i-form>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import fs from 'fs'
import { join, sep } from 'path'
import { remote } from 'electron'
import { isArray, getUpdatedKeys } from '../../shared/utils'

const { dialog } = remote.require('electron')
export default {
  data () {
    const query = this.$route.query
    return {
      form: {
        projects: [{
          path: query.path || '',
          name: query.name || '',
          scripts: (isArray(query.scripts) ? query.scripts.slice() : [query.scripts || 'npm run dev'])
        }]
      }
    }
  },
  computed: {
    ...mapGetters(['projects']),
    isEdit () {
      return !!this.$route.query.path
    },
    editIndex () {
      return this.isEdit ? this.projects.findIndex(project => {
        return project.path === this.$route.query.path && project.name === this.$route.query.name
      }) : -1
    }
  },
  methods: {
    ...mapMutations(['addProjects', 'updateProject']),
    // 动态生成脚本的唯一性验证规则
    getScriptRule (projectIndex, scriptIndex, value, cb) {
      const clone = this.form.projects[projectIndex].scripts.slice()
      // 排除自身
      clone.splice(scriptIndex, 1)
      // 有重复script
      if (clone.indexOf(value) > -1) {
        cb(new Error('不允许重复脚本'))
      } else {
        cb()
      }
    },
    // 选择目录
    selectPath (project, index) {
      const properties = ['openDirectory']
      if (!this.isEdit) {
        properties.push('multiSelections')
      }
      const path = dialog.showOpenDialog({ properties })
      if (path && path.length) {
        if (path.length === 1 && path[0] === project.path) {
          return
        }
        let existedCount = 0
        const validPath = path.filter(p => {
          try {
            const stat = fs.statSync(p)
            if (!stat.isDirectory()) {
              return false
            }
            try {
              const stat1 = fs.statSync(join(p, 'package.json'))
              if (!stat1.isFile()) {
                return false
              } else {
                // 查看已添加的项目和正在添加的项目中是否已存在
                if (this.projects.concat(this.form.projects).find(project => project.path === p)) {
                  existedCount++
                  return false
                }
                return true
              }
            } catch (error) {
              return false
            }
          } catch (error) {
            return false
          }
        })
        if (validPath.length) {
          const first = validPath.shift()
          const firstSplited = first.split(sep)
          project.path = first
          project.name = firstSplited[firstSplited.length - 1]
          project.autoLaunch = false
          this.form.projects = this.form.projects.concat(validPath.map(path => {
            const splited = path.split(sep)
            return {
              path,
              name: splited[splited.length - 1],
              scripts: ['npm run dev'],
              autoLaunch: false
            }
          }))
          validPath.splice(0, 0, first)
        }
        const messageArr = [`共选择${path.length}个目录`]
        if (path.length - validPath.length - existedCount) {
          messageArr.push(`，${path.length - validPath.length - existedCount}个无效`)
        }
        if (existedCount) {
          messageArr.push(`，${existedCount}个已存在`)
        }
        (!this.isEdit || messageArr.length > 1) && this.$Message.info(messageArr.join(''))
      }
    },
    // 更新脚本输入框内容
    updateScript (scripts, index, value) {
      // scripts.splice(index, 1)
      // scripts.splice(index, 0, value)
      scripts[index] = value
    },
    // 增加脚本
    addScript (scripts, index) {
      this.$refs.form.validateField(`projects.${index}.scripts.${scripts.length - 1}`, error => {
        if (!error) {
          scripts.push('')
        }
      })
    },
    add () {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.form.projects.push({ path: '', name: '', scripts: ['npm run dev'], autoLaunch: false })
        }
      })
    },
    up (index) {
      const item = this.form.projects.splice(index, 1)
      this.form.projects.splice(index - 1, 0, item[0])
    },
    down (index) {
      const item = this.form.projects.splice(index, 1)
      this.form.projects.splice(index + 1, 0, item[0])
    },
    save () {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.isEdit) {
            // 有修改
            if (getUpdatedKeys(this.form.projects[0], this.$route.query).length) {
              this.updateProject([this.editIndex, this.form.projects[0]])
            }
          } else {
            this.addProjects(this.form.projects)
          }
          this.$router.go(-1)
        }
      })
    }
  }
}
</script>
<style lang="stylus">
@import '../assets/styles/variable.styl'
.project-edit
  .project
    border 1px solid #e4e4e4
    border-radius 4px
    box-shadow 1px 1px 4px rgba(0, 0, 0, .1)
</style>

