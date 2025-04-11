
import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from '@/components/ui/date-picker';
import { AddFormProps } from '@/types/ComponentProps';

const AddForm: React.FC<AddFormProps> = ({
  newTool,
  handleInputChange,
  customCategory,
  setCustomCategory,
  showCustomCategoryInput,
  setShowCustomCategoryInput,
  customCategories,
  allCategoriesForSelect,
  handleAddCustomCategory,
  handleAddTool
}) => <motion.div initial={{
  opacity: 0,
  height: 0
}} animate={{
  opacity: 1,
  height: 'auto'
}} exit={{
  opacity: 0,
  height: 0
}} transition={{
  duration: 0.3
}} className="mb-8 p-5 rounded-xl glass-card">
    <h2 className="text-xl font-semibold mb-4 ai-gradient-text">Add New Expense</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="new-name" className="block text-sm font-medium text-gray-300 mb-1">
          Name <span className="text-red-400">*</span>
        </label>
        <Input id="new-name" value={newTool.name} onChange={e => handleInputChange('name', e.target.value)} className="bg-black/20 text-white border-gray-700 focus:border-ai-purple" placeholder="Subscription Name" />
      </div>

      <div>
        <label htmlFor="new-category" className="block text-sm font-medium text-gray-300 mb-1">
          Category
        </label>
        {showCustomCategoryInput ? <div className="flex gap-2">
            <Input id="custom-category" value={customCategory} onChange={e => setCustomCategory(e.target.value)} className="bg-black/20 text-white border-gray-700 focus:border-ai-purple flex-1" placeholder="New Category Name" />
            <Button variant="outline" size="icon" onClick={handleAddCustomCategory} className="border-green-500 text-green-500 hover:bg-green-500/20">
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowCustomCategoryInput(false)} className="border-red-500 text-red-500 hover:bg-red-500/20">
              <XCircle className="h-4 w-4" />
            </Button>
          </div> : <div className="flex gap-2">
            <Select value={newTool.category} onValueChange={value => handleInputChange('category', value)}>
              <SelectTrigger className="bg-black/20 text-white border-gray-700 focus:border-ai-purple flex-1">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {["General AI", "Writing", "Image Generation", "Code Generation", "Chatbots", "Video Generation", ...customCategories].map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setShowCustomCategoryInput(true)} className="border-blue-500 text-blue-500 hover:bg-blue-500/20">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>}
      </div>

      <div>
        <label htmlFor="new-cost" className="block text-sm font-medium text-gray-300 mb-1">
          Monthly Cost
        </label>
        <Input id="new-cost" type="number" min="0" step="0.01" value={newTool.subscriptionCost} onChange={e => handleInputChange('subscriptionCost', parseFloat(e.target.value) || 0)} className="bg-black/20 text-white border-gray-700 focus:border-ai-purple" placeholder="0.00" />
      </div>

      <div>
        <label htmlFor="new-renewal" className="block text-sm font-medium text-gray-300 mb-1">
          Renewal Date {newTool.subscriptionCost > 0 && <span className="text-red-400">*</span>}
        </label>
        <DatePicker date={newTool.renewalDate ? new Date(newTool.renewalDate) : undefined} onDateChange={date => {
        if (date) {
          handleInputChange('renewalDate', date.toISOString().split('T')[0]);
        } else {
          handleInputChange('renewalDate', '');
        }
      }} showLabel={false} className="w-full" placeholder="Select renewal date" />
      </div>

      <div>
        <label htmlFor="new-website" className="block text-sm font-medium text-gray-300 mb-1">
          Website URL
        </label>
        <Input id="new-website" value={newTool.website} onChange={e => handleInputChange('website', e.target.value)} className="bg-black/20 text-white border-gray-700 focus:border-ai-purple" placeholder="https://example.com" />
      </div>

      <div className="md:col-span-2">
        <label htmlFor="new-description" className="block text-sm font-medium text-gray-300 mb-1">
          Description <span className="text-red-400">*</span>
        </label>
        <Textarea id="new-description" value={newTool.description} onChange={e => handleInputChange('description', e.target.value)} className="bg-black/20 text-white border-gray-700 focus:border-ai-purple min-h-[100px]" placeholder="Add details about this subscription" />
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button onClick={handleAddTool} className="bg-ai-blue hover:bg-ai-blue/90 text-white">Add Expense</Button>
      </div>
    </div>
  </motion.div>;

export default AddForm;
