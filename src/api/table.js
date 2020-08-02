import request from '@/utils/axios-request'

export function getList(params) {
  return request({
    url: '/table/list',
    method: 'get',
    params
  })
}
