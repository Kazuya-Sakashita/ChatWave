Rails.application.routes.draw do
  mount ActionCable.server => '/cable'
  root "home#index"
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

  resources :chats, only: [:index]
  resources :groups, only: [:show] do
    post 'create_message', on: :member
    put 'messages/:id', to: 'groups#update_message', as: 'update_message'
    delete 'messages/:id', to: 'groups#destroy_message', as: 'destroy_message'
  end
  resources :direct_messages, only: [:index, :show, :create]
  get '/me', to: 'users#show'

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
