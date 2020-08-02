export default class GraphService {
  constructor() {
    this.graphUrl = 'https://graph.microsoft.com/v1.0/'
  }

  getUserEid(token, email) {
    const headers = new Headers({ Authorization: `Bearer ${token}` })
    const options = {
      headers
    }
    return fetch(`${this.graphUrl}/users/${email}?$select=extension_ddb4b494038b46af889ef8408a31e34a_mck_eid`, options)
      .then(response => response.json())
      .catch(response => {
        throw new Error(response.text())
      })
  }
}
