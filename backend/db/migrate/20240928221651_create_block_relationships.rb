class CreateBlockRelationships < ActiveRecord::Migration[7.0]
  def change
    create_table :block_relationships do |t|
      t.references :blocker, null: false, foreign_key: { to_table: :users }  # ブロックする側のユーザー
      t.references :blocked, null: false, foreign_key: { to_table: :users }  # ブロックされる側のユーザー

      t.timestamps
    end

    # 同じユーザー間で二重にブロックが発生しないように一意性を設定
    add_index :block_relationships, [:blocker_id, :blocked_id], unique: true
  end
end
