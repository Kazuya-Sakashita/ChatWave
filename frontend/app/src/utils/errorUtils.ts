// ログインエラーを処理するユーティリティ関数
export const handleLoginError = (
  payload: any,
  defaultMessage: string
): string => {
  // payloadが存在する場合、具体的なエラーメッセージを返します。
  // そうでない場合、デフォルトのエラーメッセージを返します。
  return payload ? `Failed to login: ${payload}` : defaultMessage;
};

// getErrorMessage関数をエクスポートします。この関数は、エラーオブジェクトから適切なエラーメッセージを抽出します。
export const getErrorMessage = (
  error: any,
  defaultMessage: string = "An error occurred"
): string => {
  // errorオブジェクトのresponse.data.messageプロパティが存在する場合、そのメッセージを返します。
  if (error.response?.data?.message) {
    return error.response.data.message;
    // errorオブジェクトのmessageプロパティが存在する場合、そのメッセージを返します。
  } else if (error.message) {
    return error.message;
    // 上記のいずれにも該当しない場合、デフォルトのエラーメッセージを返します。
  } else {
    return defaultMessage;
  }
};
