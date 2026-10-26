import { ref } from 'vue'

// 单例：问卷结果页写入，地图页读取后高亮
const recommended = ref([]) // 当前地图上高亮的点位
const recommendation = ref(null) // 完整推荐结果（items + boards + weights）
const recommendationBoard = ref('overall') // 当前选中的分类

export function useRecommendedPlaces() {
  return {
    recommended,
    recommendation,
    recommendationBoard,

    setRecommended(list) {
      recommended.value = Array.isArray(list) ? list : []
    },

    /** 结果页点「在地图上查看」时调用，把整份结果和当前分类一起带过去 */
    setRecommendation(result, board = 'overall') {
      recommendation.value = result || null
      recommendationBoard.value = board
      recommended.value =
        board === 'overall' ? result?.items || [] : result?.boards?.[board] || []
    },

    clearRecommended() {
      recommended.value = []
      recommendation.value = null
      recommendationBoard.value = 'overall'
    }
  }
}
