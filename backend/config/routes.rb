Rails.application.routes.draw do
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
  end
  resources :direct_messages, only: [:index, :show, :create]
  get '/me', to: 'users#show'

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
