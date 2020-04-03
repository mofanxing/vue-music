<template>
  <scroll class="suggest" ref="suggest" :data="result" :pullup="pullup" @scrollToEnd="searchMore" @beforeScroll="listScroll">
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="(item,index) in result" :key="index">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div class="no-result-wrapper">
      <no-result v-show="!hasMore && !result.length" title="Sorry，暂无搜索结果~"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
 import {search} from 'api/search'
 import {ERR_OK} from 'api/config'
 import { createSong, isValidMusic, processSongsUrl } from 'common/js/song'
 import { mapMutations, mapActions } from 'vuex'
 import Scroll from 'base/scroll/scroll'
 import Loading from 'base/loading/loading'
 import Singer from 'common/js/singer'
 import NoResult from 'base/no-result/no-result'
 const TYPE_SINGER = 'singer'
 const perpage = 20

  export default {
   props: {
     query: {
       type: String,
       default: ''
     },
     showSinger: {
       type: Boolean,
       default: true
     },
     pullup: {
       type: Boolean,
       default:true
     },
     beforeScroll: {
       type: Boolean,
       default: true
     }
   },
   data() {
     return {
       page: 1,
       result: [],
       hasMore: false,
       deley: 50//延时请求时间
     }
   },
   methods: {
     search() {
       this.page = 1      
       this.$refs.suggest.scrollTo(0, 0)
       this.hasMore = true
       search(this.query, this.page, this.showSinger, perpage).then((res) => {
         if (res.code === ERR_OK) {
            this._genResult(res.data).then((result) => {
              this.result = result
              setTimeout(() => {
                this._checkMore(res.data)
              },20)
            })    
                     
         }
       })
     },
     searchMore() {
       if (!this.hasMore) {
         return
       }
       this.page++
       search(this.query, this.page, this.showSinger, perpage).then((res) => {
         if (res.code === ERR_OK) {
            this._genResult(res.data).then((result) => {
              this.result = this.result.concat(result)
              setTimeout(() => {
                 this._checkMore(res.data)   
              },20)
            })  
                   
         }
       })
     },
     selectItem(item) {
       if (item.type === TYPE_SINGER) {
         const singer = new Singer({
           id: item.singermid,
           name: item.singername
         })
         this.$router.push({
           path: `/search/${singer.id}`
         })
         this.setSinger(singer)
       } else {
         this.insertSong(item)
       }
       this.$emit('select')
     },
     _checkMore(data) {
      const song = data.song
      if (!song.list.length || (song.curnum + song.curpage * 20) >= song.totalnum) {
        this.hasMore = false
      } else {
        if (!this.$refs.suggest.scroll.hasVerticalScroll) {
            this.searchMore()
        }
      }
     },
     _genResult(data) {
       let ret = []
        if (data.zhida && data.zhida.singerid && this.page === 1) {
          ret.push({ ...data.zhida, ...{ type: TYPE_SINGER } })
        }
        return processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
          ret = ret.concat(songs)
          return ret
        })
     },
      _normalizeSongs (list) {
        let ret = []
        list.forEach((musicData) => {
          if (isValidMusic(musicData)) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      },    
     getIconCls(item) {
       if (item.type === TYPE_SINGER) {
         return 'icon-mine'
       } else {
         return 'icon-music'
       }
     },
     getDisplayName(item) {
       if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name} ~ ${item.singer}`
        }
     },
     refresh() {
       this.$refs.suggest.refresh()
     },
     listScroll() {
       this.$emit('listScroll')
     },
     ...mapMutations({
       setSinger: 'SET_SINGER'
     }),
     ...mapActions([
       'insertSong'
     ])
   },
   watch: {
     query() {       
       if (this.query === ''){
         return false
       }else {
         clearTimeout(this.timer)
         this.timer = setTimeout(() => {
           this.search()
         },this.deley)
       }
       
     }
   },
   components: {
     Scroll,
     Loading,
     NoResult
   }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>