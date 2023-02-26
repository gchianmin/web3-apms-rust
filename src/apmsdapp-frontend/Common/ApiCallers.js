export default async function ApiCallers(props) {
    const apiUrl = props.apiUrl;
    const method = props.method;
    const body = props.body;

    const response = await fetch(apiUrl, {
        method: method,
        body: body,
    })
    return response

}