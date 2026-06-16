class CreateArticleLikes < ActiveRecord::Migration[7.1]
  def change
    create_table :article_likes, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.references :user,    null: false, foreign_key: true, type: :uuid
      t.references :article, null: false, foreign_key: true, type: :uuid

      t.timestamps null: false
    end

    add_index :article_likes, %i[user_id article_id], unique: true
  end
end
