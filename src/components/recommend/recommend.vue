<template>
  <div class="recommend" ref="recommend">
    <Scroll ref="scroll" :data="discList" class="recommend-content">
      <div>
        <div class="slider-wraper" v-if="recommends.length">
          <slider>
            <div v-for="(i,index) in recommends" :key="index">
              <a :href="i.linkUrl">
                <img class="needsclick"  @load="loadImage" :src="i.picUrl"/>
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li @click="selectItem(item)" v-for="(item,index) in discList" class="item" :key="index">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl"/>
              </div> 
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div> 
            </li>         
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </Scroll>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import Slider from 'base/slider/slider'
  import {ERR_OK} from 'api/config'
  import {getRecommend, getDiscList} from 'api/recommend'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {playlistMixin} from 'common/js/mixin'
  import {mapMutations} from 'vuex'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        recommends: [],
        discList: []
      }
    },
   created() {
     this._getRecommend()
     this._getDiscList()  
   },
   methods: {
     selectItem(item) {
       this.$router.push({
         path: `/recommend/${item.dissid}`
       })
       this.setDisc(item)
     },
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
     loadImage() { // 图片加载完成后，让scroll组件重新计算高度，由于图片高度都是一样的，所以仅需调用一次
        if (!this.checkloaded) {
          this.$refs.scroll.refresh()   
          this.checkloaded = true               
        }
      },
    _getRecommend() { // 请求轮播图片并初始化this.recommends     
      getRecommend().then((res) => {
          if (res.code === ERR_OK) {
            this.recommends = res.data.slider
          }
        })
      },
      _getDiscList() { // 请求推荐歌单并初始化this.discList     
        getDiscList().then((res) => {
          if (res.code === ERR_OK) {
            this.discList = res.data.list
          }
        })

      },
      ...mapMutations({
        setDisc: 'SET_DISC'
      })
     
   },
   components:{
     Slider,
     Scroll,
     Loading
   }
    
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
