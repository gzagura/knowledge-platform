class CreateArticles < ActiveRecord::Migration[7.1]
  def change
    create_table :articles, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.integer :wikipedia_id,          null: false
      t.string  :title,                 null: false
      t.text    :extract,               null: false
      t.text    :full_content
      t.string  :language,              null: false, default: 'en'
      t.string  :category
      t.integer :reading_time_minutes,  null: false, default: 5
      t.boolean :is_featured,           null: false, default: false
      t.string  :image_url
      t.string  :url
      t.text    :fun_fact

      t.timestamps null: false
    end

    add_index :articles, :language
    add_index :articles, :is_featured
    add_index :articles, :category
    add_index :articles, %i[wikipedia_id language], unique: true
  end
end
