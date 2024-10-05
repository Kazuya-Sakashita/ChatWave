Rails.application.routes.draw do
  mount ActionCable.server => '/cable'
  root "chats#index"
  devise_for :users, path: '', path_names: {
    sign_in: 'login',
    sign_out: 'logout',
    registration: 'signup'
  },
  controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations',
    confirmations: 'users/confirmations',
    passwords: 'users/passwords'
  }
  resource :profile, only: [:new, :create, :edit, :update, :show]
  resource :notification_setting, only: [:show, :update]
  resources :friends, only: [:index, :create, :update] do
    member do
      patch 'update', to: 'friends#update'
      patch :block # ブロック処理のルート
      patch :unblock # ブロック解除処理のルート
      delete :cancel # フレンド申請キャンセルのルートを追加
    end
    collection do
      get :blocked_friends # ブロックリストを取得するルート
      get :pending_requests
    end
  end

  resources :chats, only: [:index]
  resources :groups, only: [:show] do
    member do
      post 'create_message'
      post 'clear_new_messages'
    end

    collection do
      get 'new_messages'
      post 'mark_as_read'
    end

    # メッセージに関連するルーティングを追加
    resources :messages, only: [] do
      member do
        put '', to: 'groups#update_message', as: 'update' # '/groups/:group_id/messages/:id'のルート
        delete '', to: 'groups#destroy_message', as: 'destroy' # '/groups/:group_id/messages/:id'のルート
      end
    end
  end

  resources :direct_messages, only: [:index, :show, :create, :update, :destroy] do
    collection do
      get 'new_messages'
      post 'clear_new_messages'
      post :mark_as_read
    end
  end
  get '/me', to: 'users#show'

    # ユーザーリストを取得するルートを追加
    resources :users, only: [:index]

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
